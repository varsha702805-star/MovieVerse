const express = require('express')
const router = express.Router()
const { register, login, getProfile, updateAvatar } = require('../controllers/authController')
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

router.post('/register', register)
router.post('/login', login)
router.get('/profile', auth, getProfile)
router.put('/profile/avatar', auth, updateAvatar)

module.exports = router