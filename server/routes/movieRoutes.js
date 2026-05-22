const express = require('express')
const router = express.Router()
const https = require('https')
const axios = require('axios')

const tmdbAxios = {
  get: async (url, config = {}) => {
    const apiAgent = new https.Agent({ family: 4, keepAlive: false });
    
    const attempts = [
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Encoding': 'identity',
          'Connection': 'close'
        }
      },
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json',
          'Accept-Encoding': 'identity',
          'Connection': 'close'
        }
      },
      {
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'identity',
          'Connection': 'close'
        }
      }
    ];

    let lastError = null;
    for (let i = 0; i < attempts.length; i++) {
      try {
        const reqConfig = {
          ...config,
          baseURL: 'https://api.themoviedb.org/3',
          url: url,
          httpsAgent: apiAgent,
          headers: {
            ...config.headers,
            ...attempts[i].headers
          },
          timeout: 8000
        };
        const response = await axios(reqConfig);
        return response;
      } catch (err) {
        lastError = err;
        const isReset = err.code === 'ECONNRESET' || err.message?.includes('ECONNRESET') || err.message?.includes('socket hang up');
        console.warn(`[TMDB] GET ${url} attempt ${i + 1} failed: ${err.message} (Code: ${err.code}). ${isReset ? 'ECONNRESET detected, retrying...' : ''}`);
        if (err.response && err.response.status >= 400 && err.response.status < 500) {
          throw err;
        }
      }
    }
    throw lastError;
  }
}

const API_KEY = process.env.TMDB_API_KEY

router.get('/popular', async (req, res) => {
  try {
    const response = await tmdbAxios.get('/movie/popular', {
      params: { api_key: API_KEY, page: 1 }
    })
    const movies = response.data.results.map(m => ({
      imdbID: m.id,
      Title: m.title,
      Year: m.release_date?.split('-')[0] || 'N/A',
      Poster: m.poster_path
        ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
        : 'N/A',
      Rating: m.vote_average?.toFixed(1) || 'N/A'
    }))
    res.json({ Search: movies })
  } catch (err) {
    console.error('Popular API Error:', err)
    res.status(500).json({ message: 'Error fetching movies' })
  }
})

router.get('/discover', async (req, res) => {
  try {
    const { genre, sort_by, year, rating, page = 1 } = req.query
    const params = {
      api_key: API_KEY,
      page: parseInt(page),
      sort_by: sort_by || 'popularity.desc'
    }
    if (genre && genre !== '') params.with_genres = genre
    if (year && year !== '') params.primary_release_year = year
    if (rating && rating !== '') params['vote_average.gte'] = rating

    const response = await tmdbAxios.get('/discover/movie', { params })
    const movies = response.data.results.map(m => ({
      imdbID: m.id,
      Title: m.title,
      Year: m.release_date?.split('-')[0] || 'N/A',
      Poster: m.poster_path
        ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
        : 'N/A',
      Rating: m.vote_average?.toFixed(1) || 'N/A'
    }))
    res.json({ Search: movies, total_pages: response.data.total_pages })
  } catch (err) {
    console.error('Discover API Error:', err)
    res.status(500).json({ message: 'Error fetching discover movies' })
  }
})

router.get('/search', async (req, res) => {
  try {
    const { query } = req.query
    const response = await tmdbAxios.get('/search/movie', {
      params: { api_key: API_KEY, query, page: 1 }
    })
    const movies = response.data.results.map(m => ({
      imdbID: m.id,
      Title: m.title,
      Year: m.release_date?.split('-')[0] || 'N/A',
      Poster: m.poster_path
        ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
        : 'N/A',
      Rating: m.vote_average?.toFixed(1) || 'N/A'
    }))
    res.json({ Search: movies })
  } catch (err) {
    res.status(500).json({ message: 'Error fetching movies' })
  }
})

router.get('/genre', async (req, res) => {
  try {
    const { id } = req.query
    const response = await tmdbAxios.get('/discover/movie', {
      params: {
        api_key: API_KEY,
        with_genres: id,
        sort_by: 'popularity.desc',
        page: 1
      }
    })
    const movies = response.data.results.map(m => ({
      imdbID: m.id,
      Title: m.title,
      Year: m.release_date?.split('-')[0] || 'N/A',
      Poster: m.poster_path
        ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
        : 'N/A',
      Rating: m.vote_average?.toFixed(1) || 'N/A'
    }))
    res.json({ Search: movies })
  } catch (err) {
    res.status(500).json({ message: 'Error fetching movies' })
  }
})

router.get('/details/:id', async (req, res) => {
  try {
    let { id } = req.params
    let isTV = false
    
    // Check if ID is an IMDb ID (starts with 'tt')
    if (id && String(id).startsWith('tt')) {
      try {
        const findRes = await tmdbAxios.get(`/find/${id}`, {
          params: { api_key: API_KEY, external_source: 'imdb_id' }
        })
        const movie = findRes.data.movie_results?.[0]
        const tvShow = findRes.data.tv_results?.[0]
        if (movie) {
          id = movie.id // Translate to TMDB integer ID
        } else if (tvShow) {
          id = tvShow.id
          isTV = true
        } else {
          console.warn(`IMDb ID ${id} not found in TMDB find results`)
          return res.status(404).json({ message: 'Movie or TV Show not found' })
        }
      } catch (err) {
        console.error(`Failed to translate IMDb ID ${id}:`, err.message)
        return res.status(404).json({ message: 'Movie or TV Show not found' })
      }
    }

    // Fetch details first to ensure it exists
    let details
    let fetchType = isTV ? 'tv' : 'movie'
    try {
      details = await tmdbAxios.get(`/${fetchType}/${id}`, { params: { api_key: API_KEY } })
    } catch (err) {
      if (!isTV && err.response && err.response.status === 404) {
        try {
          fetchType = 'tv'
          details = await tmdbAxios.get(`/tv/${id}`, { params: { api_key: API_KEY } })
          isTV = true
        } catch (tvErr) {
          console.error(`Failed to fetch as TV show for ID ${id}:`, tvErr.message)
          return res.status(404).json({ message: 'Movie or TV Show not found' })
        }
      } else {
        console.error(`Failed to fetch details for ID ${id}:`, err.message)
        return res.status(404).json({ message: 'Movie or TV Show not found' })
      }
    }

    // Safely fetch credits and videos as background promises that won't crash the page if they fail
    let creditsData = { crew: [], cast: [] }
    let videosData = { results: [] }

    try {
      const creditsRes = await tmdbAxios.get(`/${fetchType}/${id}/credits`, { params: { api_key: API_KEY } })
      creditsData = creditsRes.data
    } catch (err) {
      console.warn(`Failed to fetch credits for ID ${id}:`, err.message)
    }

    try {
      const videosRes = await tmdbAxios.get(`/${fetchType}/${id}/videos`, { params: { api_key: API_KEY } })
      videosData = videosRes.data
    } catch (err) {
      console.warn(`Failed to fetch videos for ID ${id}:`, err.message)
    }

    const trailer = videosData.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube')
    const director = fetchType === 'tv'
      ? (details.data.created_by?.[0]?.name || 'N/A')
      : (creditsData.crew?.find(c => c.job === 'Director')?.name || 'N/A')
    const cast = creditsData.cast?.slice(0, 5).map(c => c.name).join(', ') || ''

    res.json({
      imdbID: details.data.id,
      Title: details.data.title || details.data.name,
      Year: (details.data.release_date || details.data.first_air_date)?.split('-')[0] || 'N/A',
      Runtime: details.data.runtime ? `${details.data.runtime} min` : (details.data.episode_run_time?.[0] ? `${details.data.episode_run_time[0]} min` : 'N/A'),
      Genre: details.data.genres?.map(g => g.name).join(', ') || 'N/A',
      Plot: details.data.overview || 'N/A',
      Director: director,
      Actors: cast || 'N/A',
      Language: details.data.original_language?.toUpperCase() || 'N/A',
      Awards: `TMDB Rating: ${details.data.vote_average?.toFixed(1) || 'N/A'}/10`,
      Poster: details.data.poster_path
        ? `https://image.tmdb.org/t/p/w500${details.data.poster_path}`
        : 'N/A',
      imdbRating: details.data.vote_average?.toFixed(1) || 'N/A',
      Trailer: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null
    })
  } catch (err) {
    console.error('Error fetching movie details:', err)
    res.status(500).json({ message: 'Error fetching movie/TV details' })
  }
})

router.get('/details/:id/similar', async (req, res) => {
  try {
    let { id } = req.params
    let isTV = false

    // Check if ID is an IMDb ID (starts with 'tt')
    if (id && String(id).startsWith('tt')) {
      try {
        const findRes = await tmdbAxios.get(`/find/${id}`, {
          params: { api_key: API_KEY, external_source: 'imdb_id' }
        })
        const movie = findRes.data.movie_results?.[0]
        const tvShow = findRes.data.tv_results?.[0]
        if (movie) {
          id = movie.id // Translate to TMDB integer ID
        } else if (tvShow) {
          id = tvShow.id
          isTV = true
        } else {
          return res.json({ Search: [] })
        }
      } catch (err) {
        console.error(`Failed to translate IMDb ID ${id} for similar:`, err.message)
        return res.json({ Search: [] })
      }
    }

    let fetchType = isTV ? 'tv' : 'movie'
    let response
    try {
      response = await tmdbAxios.get(`/${fetchType}/${id}/similar`, {
        params: { api_key: API_KEY, page: 1 }
      })
    } catch (err) {
      if (!isTV && err.response && err.response.status === 404) {
        try {
          fetchType = 'tv'
          response = await tmdbAxios.get(`/tv/${id}/similar`, {
            params: { api_key: API_KEY, page: 1 }
          })
        } catch (tvErr) {
          console.error(`Failed to fetch similar for TV show ID ${id}:`, tvErr.message)
          return res.json({ Search: [] })
        }
      } else {
        console.error('Similar API Error:', err)
        return res.json({ Search: [] })
      }
    }

    const movies = response.data.results.slice(0, 8).map(m => ({
      imdbID: m.id,
      Title: m.title || m.name,
      Year: (m.release_date || m.first_air_date)?.split('-')[0] || 'N/A',
      Poster: m.poster_path
        ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
        : 'N/A',
      Rating: m.vote_average?.toFixed(1) || 'N/A'
    }))
    res.json({ Search: movies })
  } catch (err) {
    console.error('Similar API Error:', err)
    res.status(500).json({ message: 'Error fetching similar movies/TV shows' })
  }
})

module.exports = router