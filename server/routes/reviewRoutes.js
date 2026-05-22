const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const jwt = require('jsonwebtoken')

// Authentication Middleware
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

// @route   POST /api/reviews
// @desc    Add a movie review
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { movieId, title, rating, content } = req.body
    
    if (!movieId || !title || !rating || !content) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    const review = await prisma.review.create({
      data: {
        movieId: String(movieId),
        title,
        rating: parseInt(rating),
        content,
        userId: req.user.id
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    })

    res.status(201).json(review)
  } catch (err) {
    console.error('Error creating review:', err)
    res.status(500).json({ message: 'Server error creating review' })
  }
})

// @route   GET /api/reviews/movie/:movieId
// @desc    Get all reviews for a specific movie
// @access  Public
router.get('/movie/:movieId', async (req, res) => {
  try {
    const { movieId } = req.params
    const reviews = await prisma.review.findMany({
      where: { movieId: String(movieId) },
      include: {
        user: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(reviews)
  } catch (err) {
    console.error('Error fetching movie reviews:', err)
    res.status(500).json({ message: 'Server error fetching reviews' })
  }
})

// @route   GET /api/reviews/user
// @desc    Get all reviews written by the active user
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    })
    res.json(reviews)
  } catch (err) {
    console.error('Error fetching user reviews:', err)
    res.status(500).json({ message: 'Server error fetching reviews' })
  }
})

// @route   DELETE /api/reviews/:id
// @desc    Delete a specific review
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params

    const review = await prisma.review.findUnique({
      where: { id: parseInt(id) }
    })

    if (!review) {
      return res.status(404).json({ message: 'Review not found' })
    }

    if (review.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this review' })
    }

    await prisma.review.delete({
      where: { id: parseInt(id) }
    })

    res.json({ message: 'Review successfully removed' })
  } catch (err) {
    console.error('Error deleting review:', err)
    res.status(500).json({ message: 'Server error deleting review' })
  }
})

module.exports = router
