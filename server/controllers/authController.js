const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return res.status(400).json({ message: 'User already exists' })
    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { name, email, password: hashed }
    })
    res.json({ message: 'Registered successfully!' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(400).json({ message: 'User not found' })
    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(400).json({ message: 'Wrong password' })
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, createdAt: true, avatar: true }
    })
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

const updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatar },
      select: { id: true, name: true, email: true, createdAt: true, avatar: true }
    })
    res.json(user)
  } catch (err) {
    console.error('Failed to update avatar:', err)
    res.status(500).json({ message: 'Server error updating avatar' })
  }
}

module.exports = { register, login, getProfile, updateAvatar }