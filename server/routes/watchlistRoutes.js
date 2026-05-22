const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const jwt = require('jsonwebtoken')

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'No token' })
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ message: 'Invalid token' })
  }
}

router.post('/add', auth, async (req, res) => {
  const { movieId, title, poster } = req.body
  const item = await prisma.watchlist.create({
    data: { movieId: String(movieId), title, poster, userId: req.user.id }
  })
  res.json(item)
})

router.get('/', auth, async (req, res) => {
  const items = await prisma.watchlist.findMany({
    where: { userId: req.user.id }
  })
  res.json(items)
})

router.delete('/:id', auth, async (req, res) => {
  await prisma.watchlist.delete({ where: { id: parseInt(req.params.id) } })
  res.json({ message: 'Removed!' })
})

module.exports = router