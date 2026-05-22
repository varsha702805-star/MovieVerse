const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

const authRoutes = require('./routes/authRoutes')
app.use('/api/auth', authRoutes)

const movieRoutes = require('./routes/movieRoutes')
app.use('/api/movies', movieRoutes)

const watchlistRoutes = require('./routes/watchlistRoutes')
app.use('/api/watchlist', watchlistRoutes)

const reviewRoutes = require('./routes/reviewRoutes')
app.use('/api/reviews', reviewRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})