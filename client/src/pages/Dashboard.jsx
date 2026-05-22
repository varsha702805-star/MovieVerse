import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../utils/api'
import Navbar from '../components/Navbar'
import Toast from '../components/Toast'
import VideoModal from '../components/VideoModal'

const GENRES = [
  { label: 'Action', id: 28 },
  { label: 'Comedy', id: 35 },
  { label: 'Horror', id: 27 },
  { label: 'Romance', id: 10749 },
  { label: 'Thriller', id: 53 },
  { label: 'Sci-Fi', id: 878 },
  { label: 'Drama', id: 18 },
  { label: 'Animation', id: 16 },
  { label: 'Crime', id: 80 },
  { label: 'Fantasy', id: 14 },
  { label: 'Mystery', id: 9648 },
  { label: 'Adventure', id: 12 },
]

function Dashboard() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  
  // State variables
  const [movies, setMovies] = useState(() => {
    const cached = sessionStorage.getItem('dashboard_movies')
    return cached ? JSON.parse(cached) : []
  })
  const [trendingMovies, setTrendingMovies] = useState(() => {
    const cached = sessionStorage.getItem('dashboard_trending')
    return cached ? JSON.parse(cached) : []
  })
  const [featured, setFeatured] = useState(() => {
    const cached = sessionStorage.getItem('dashboard_featured')
    return cached ? JSON.parse(cached) : null
  })

  const hasCache = !!(sessionStorage.getItem('dashboard_movies') && sessionStorage.getItem('dashboard_trending') && sessionStorage.getItem('dashboard_featured'))

  const [loading, setLoading] = useState(!hasCache)
  const [trendingLoading, setTrendingLoading] = useState(!hasCache)
  
  // Advanced filters state
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [sortBy, setSortBy] = useState('popularity.desc')
  const [minRating, setMinRating] = useState('0')
  const [releaseYear, setReleaseYear] = useState('')
  const [page, setPage] = useState(() => {
    const cached = sessionStorage.getItem('dashboard_page')
    return cached ? parseInt(cached, 10) : 1
  })
  const [totalPages, setTotalPages] = useState(() => {
    const cached = sessionStorage.getItem('dashboard_total_pages')
    return cached ? parseInt(cached, 10) : 1
  })
  const [loadingMore, setLoadingMore] = useState(false)
  
  // UI States
  const [toast, setToast] = useState(null)
  const [activeTrailer, setActiveTrailer] = useState(null)

  const handleGenreClick = (genre) => {
    if (activeGenreId === String(genre.id)) {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev)
        next.delete('genre')
        next.delete('genreId')
        return next
      })
    } else {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev)
        next.set('genre', genre.label)
        next.set('genreId', String(genre.id))
        return next
      })
    }
  }

  const activeGenreId = searchParams.get('genreId') || ''
  const activeGenreLabel = searchParams.get('genre') || ''
  const hasActiveFilter = !!(searchParams.get('search') || activeGenreId)

  // Scroll reference for main grid anchor scroll
  const browseSectionRef = useRef(null)

  // Auth check on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/')
    }
  }, [navigate])

  // Initial loads
  useEffect(() => {
    if (sessionStorage.getItem('dashboard_trending') && sessionStorage.getItem('dashboard_featured')) {
      return
    }
    fetchTrending()
  }, [])

  // Listen to search params or filter changes to query discover/genre
  useEffect(() => {
    const searchQuery = searchParams.get('search') || ''
    const isRestingState = !searchQuery && !activeGenreId && !releaseYear && minRating === '0' && sortBy === 'popularity.desc'
    
    if (isRestingState && sessionStorage.getItem('dashboard_movies')) {
      return
    }

    setPage(1)
    fetchMovies(1, true)
  }, [activeGenreId, sortBy, minRating, releaseYear, searchParams])

  const fetchTrending = async () => {
    try {
      setTrendingLoading(true)
      const res = await api.get('/movies/popular')
      const popular = res.data.Search || []
      const shuffledPopular = [...popular].sort(() => 0.5 - Math.random())
      setTrendingMovies(shuffledPopular)
      sessionStorage.setItem('dashboard_trending', JSON.stringify(shuffledPopular))
      
      // Select the first popular movie to be the widescreen hero
      if (shuffledPopular.length > 0) {
        fetchFeaturedMovie(shuffledPopular[0].imdbID)
      }
    } catch (err) {
      console.error('Failed to fetch trending:', err)
    } finally {
      setTrendingLoading(false)
    }
  }

  const fetchFeaturedMovie = async (id) => {
    try {
      const res = await api.get(`/movies/details/${id}`)
      setFeatured(res.data)
      sessionStorage.setItem('dashboard_featured', JSON.stringify(res.data))
    } catch (err) {
      console.error('Failed to fetch featured movie detail:', err)
    }
  }

  const fetchMovies = async (targetPage = 1, shouldReset = true) => {
    try {
      if (targetPage === 1) setLoading(true)
      else setLoadingMore(true)

      let res
      const searchQuery = searchParams.get('search') || ''
      const isRestingState = !searchQuery && !activeGenreId && !releaseYear && minRating === '0' && sortBy === 'popularity.desc'

      if (searchQuery) {
        res = await api.get(`/movies/search?query=${searchQuery}&page=${targetPage}`)
        if (shouldReset) {
          setMovies(res.data.Search || [])
        } else {
          setMovies((prev) => [...prev, ...(res.data.Search || [])])
        }
        setTotalPages(1) // Search typically has single active page on basic API
      } else {
        // Use our new advanced discover API
        let queryPage = targetPage
        if (targetPage === 1 && !activeGenreId && !releaseYear && minRating === '0') {
          // Select a random page between 1 and 8 to get fresh content on load/reset
          queryPage = Math.floor(Math.random() * 8) + 1
        }
        res = await api.get(`/movies/discover`, {
          params: {
            genre: activeGenreId,
            sort_by: sortBy,
            year: releaseYear,
            rating: minRating,
            page: queryPage
          }
        })
        const results = res.data.Search || []
        const shuffled = [...results].sort(() => 0.5 - Math.random())
        
        if (shouldReset) {
          setMovies(shuffled)
          if (isRestingState) {
            sessionStorage.setItem('dashboard_movies', JSON.stringify(shuffled))
            sessionStorage.setItem('dashboard_page', '1')
            sessionStorage.setItem('dashboard_total_pages', String(res.data.total_pages || 1))
          }
        } else {
          setMovies((prev) => {
            const nextMovies = [...prev, ...shuffled]
            if (isRestingState) {
              sessionStorage.setItem('dashboard_movies', JSON.stringify(nextMovies))
            }
            return nextMovies
          })
          if (isRestingState) {
            sessionStorage.setItem('dashboard_page', String(targetPage))
          }
        }
        setTotalPages(res.data.total_pages || 1)
      }
    } catch (err) {
      console.error('Failed to fetch movies:', err)
      showToast('Error loading movies. Please try again.', 'error')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const clearSearchOrFilters = () => {
    setSortBy('popularity.desc')
    setMinRating('0')
    setReleaseYear('')
    setSearchParams({})
  }

  const loadNextPage = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchMovies(nextPage, false)
  }

  const addToWatchlist = async (e, movie) => {
    e.stopPropagation() // Avoid card click triggers detail page navigation
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        showToast('Please login first!', 'warning')
        navigate('/')
        return
      }
      await api.post('/watchlist/add', {
        movieId: String(movie.imdbID),
        title: movie.Title,
        poster: movie.Poster,
      })
      showToast(`"${movie.Title}" added to watchlist!`, 'success')
    } catch (err) {
      showToast('Movie is already in your watchlist!', 'info')
    }
  }

  const showToast = (message, type) => {
    setToast({ message, type })
  }

  const getRatingColor = (rating) => {
    const num = parseFloat(rating)
    if (isNaN(num)) return 'text-zinc-400'
    if (num >= 7.5) return 'text-emerald-400 font-black'
    if (num >= 6) return 'text-yellow-400 font-bold'
    return 'text-rose-400 font-semibold'
  }

  // Skeleton shimmer loaders
  const renderSkeletons = (count = 10) => {
    return Array.from({ length: count }).map((_, index) => (
      <div key={index} className="bg-zinc-900/40 border border-zinc-900 rounded-2xl overflow-hidden shadow-lg h-[390px] flex flex-col justify-between">
        <div className="w-full h-64 animate-shimmer" />
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="h-5 bg-zinc-800 rounded-lg w-11/12 animate-shimmer mb-2" />
            <div className="h-3.5 bg-zinc-800 rounded-lg w-1/2 animate-shimmer" />
          </div>
          <div className="h-9 bg-zinc-800 rounded-xl w-full animate-shimmer mt-4" />
        </div>
      </div>
    ))
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-16 animate-fade-in">
      <Navbar />

      {/* Featured Movie Cinema Hero Section */}
      {featured && !hasActiveFilter && (
        <div className="relative w-full h-[70vh] md:h-[80vh] flex items-end overflow-hidden group">
          {/* Hero Widescreen Cover image with gradient mask */}
          <div className="absolute inset-0 bg-black z-0">
            <img
              src={featured.Poster !== 'N/A' ? featured.Poster : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1920'}
              alt={featured.Title}
              className="w-full h-full object-cover opacity-35 scale-102 group-hover:scale-100 transition duration-1000 blur-sm brightness-75 md:object-[center_20%]"
            />
            {/* Cinematic Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-black/50" />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/20 to-transparent hidden md:block" />
          </div>

          {/* Hero Content Details Overlay */}
          <div className="relative z-10 max-w-7xl mx-auto w-full px-6 md:px-8 pb-12 md:pb-20 flex flex-col items-start gap-4">
            <span className="bg-red-600/10 border border-red-500/30 text-red-400 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-widest animate-pulse">
              Featured Spotlights
            </span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none text-zinc-100 glow-red">
              {featured.Title}
            </h1>

            <div className="flex gap-4 text-xs md:text-sm text-zinc-300 font-semibold items-center flex-wrap">
              <span className="bg-zinc-800/80 px-2.5 py-1 rounded-lg border border-zinc-700">{featured.Year}</span>
              <span className="bg-zinc-800/80 px-2.5 py-1 rounded-lg border border-zinc-700">{featured.Runtime}</span>
              <span className="text-yellow-400 flex items-center gap-1">★ {featured.imdbRating || 'N/A'}</span>
              <span className="text-zinc-500">•</span>
              <span className="text-red-400">{featured.Genre}</span>
            </div>

            <p className="text-zinc-400 text-sm md:text-base max-w-2xl leading-relaxed line-clamp-3">
              {featured.Plot !== 'N/A' ? featured.Plot : 'Curated movie selections for your premium viewing pleasure. Explore and compile your ultimate tracking database today.'}
            </p>

            <div className="flex gap-4 mt-2 w-full sm:w-auto flex-wrap">
              <button
                onClick={() => navigate(`/movie/${featured.imdbID}`)}
                className="flex-1 sm:flex-initial bg-red-600 hover:bg-red-700 text-white font-extrabold px-8 py-3.5 rounded-xl transition duration-200 glow-btn-red active:scale-95 text-center flex items-center justify-center gap-2 cursor-pointer text-sm tracking-wide"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                More Info
              </button>

              {featured.Trailer && (
                <button
                  onClick={() => setActiveTrailer(featured.Trailer)}
                  className="flex-1 sm:flex-initial bg-zinc-800/90 hover:bg-zinc-700/90 text-white font-extrabold px-8 py-3.5 rounded-xl transition duration-200 border border-zinc-700 flex items-center justify-center gap-2 active:scale-95 cursor-pointer text-sm tracking-wide"
                >
                  <svg className="w-5 h-5 text-red-500 fill-current" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Watch Trailer
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Dashboard Space */}
      <div className={`max-w-7xl mx-auto px-6 md:px-8 ${hasActiveFilter ? 'pt-28' : 'pt-10'}`} ref={browseSectionRef}>
        
        {/* Horizontal scrollable genre tags list */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3.5 flex items-center gap-2">
            Explore Genre Categories
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-4 pt-1 scrollbar-thin scrollbar-thumb-zinc-850 scrollbar-track-transparent">
            {GENRES.map((genre) => {
              const isSelected = activeGenreId === String(genre.id)
              return (
                <button
                  key={genre.id}
                  onClick={() => handleGenreClick(genre)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-extrabold tracking-wide transition-all duration-300 border whitespace-nowrap active:scale-95 cursor-pointer ${
                    isSelected
                      ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-950/30 glow-red'
                      : 'bg-zinc-900/50 border-zinc-850 text-zinc-400 hover:text-white hover:border-zinc-700 hover:bg-zinc-900'
                  }`}
                >
                  <span>{genre.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Sliding Discover Multi-Filter Panel */}
        {isFilterOpen && (
          <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-6 mb-8 animate-slide-in grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 glass-card">
            
            {/* Sort Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Sort Results By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 outline-none focus:border-red-600 transition font-semibold"
              >
                <option value="popularity.desc">Popularity (High → Low)</option>
                <option value="vote_average.desc">Rating (High → Low)</option>
                <option value="primary_release_date.desc">Release Date (New → Old)</option>
                <option value="title.asc">Title (A → Z)</option>
              </select>
            </div>

            {/* Minimum Rating slider */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Minimum TMDB Rating</label>
                <span className="text-xs text-yellow-400 font-extrabold bg-yellow-950/20 px-2 py-0.5 rounded border border-yellow-500/20">★ {minRating}+</span>
              </div>
              <input
                type="range"
                min="0"
                max="9"
                step="1"
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-600 my-3.5"
              />
            </div>

            {/* Release Year Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Specific Release Year</label>
              <input
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                placeholder="e.g. 2024"
                value={releaseYear}
                onChange={(e) => setReleaseYear(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 outline-none focus:border-red-600 transition font-semibold"
              />
            </div>

            {/* Reset / Actions */}
            <div className="flex items-end gap-2">
              <button
                onClick={clearSearchOrFilters}
                className="w-full bg-zinc-850 hover:bg-zinc-800 text-zinc-300 font-bold py-3.5 rounded-xl text-sm transition duration-200 active:scale-95 cursor-pointer border border-zinc-800"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}

        {/* Netflix-style Trending Row (Render only if no active search query or genre filter is active) */}
        {!searchParams.get('search') && !activeGenreId && trendingMovies.length > 0 && (
          <div className="mb-10">
            <h3 className="text-xl font-extrabold mb-4 text-zinc-200 tracking-wide flex items-center gap-2">
              <span className="w-1.5 h-6 bg-red-600 rounded-full" />
              Trending Now
            </h3>
            {trendingLoading ? (
              <div className="flex gap-4 overflow-x-auto pb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-48 h-72 rounded-2xl bg-zinc-900 animate-shimmer" />
                ))}
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-4 scroll-smooth">
                {trendingMovies.map((movie) => (
                  <div
                    key={`trending-${movie.imdbID}`}
                    onClick={() => navigate(`/movie/${movie.imdbID}`)}
                    className="flex-shrink-0 w-48 bg-zinc-900 rounded-2xl overflow-hidden hover:scale-105 transition duration-300 cursor-pointer shadow-lg group border border-zinc-900 hover:border-zinc-800"
                  >
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-950">
                      <img
                        src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Image'}
                        alt={movie.Title}
                        className="w-full h-full object-cover group-hover:scale-102 transition duration-500"
                        loading="lazy"
                      />
                      {/* Hover Overlay with details */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-3.5">
                        <span className="text-yellow-400 text-xs font-bold mb-1">★ {movie.Rating || 'N/A'}</span>
                        <h4 className="font-extrabold text-xs text-white truncate">{movie.Title}</h4>
                        <p className="text-[10px] text-zinc-400 mt-0.5">{movie.Year}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Section Header with Actions Inline */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 pb-2 border-b border-zinc-900/80">
          <h3 className="text-xl font-extrabold text-zinc-200 tracking-wide flex items-center gap-2">
            <span className="w-1.5 h-6 bg-red-600 rounded-full animate-pulse" />
            {searchParams.get('search')
              ? `Search Results for "${searchParams.get('search')}"`
              : activeGenreLabel
              ? `${activeGenreLabel} Curations`
              : 'Browse Complete Selections'}
          </h3>
          
          <div className="flex items-center gap-3">
            {/* Advanced Filters Toggle Button */}
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`px-4 py-2 rounded-xl border text-xs font-bold tracking-wide transition duration-200 cursor-pointer flex items-center gap-2 ${
                isFilterOpen || minRating > 0 || releaseYear || sortBy !== 'popularity.desc'
                  ? 'bg-red-950/40 border-red-500/40 text-red-400 shadow-md shadow-red-950/10'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <span>{isFilterOpen ? 'Hide Filters' : 'Advanced Filters'}</span>
            </button>

            {/* Clear Filters Button (Visible only if filters are active) */}
            {(searchParams.get('search') || activeGenreId || minRating > 0 || releaseYear || sortBy !== 'popularity.desc') && (
              <button
                onClick={clearSearchOrFilters}
                className="bg-zinc-900/60 hover:bg-red-950/20 text-zinc-400 hover:text-red-500 border border-zinc-800 hover:border-red-500/20 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <span>Clear All</span>
                <span>✕</span>
              </button>
            )}
          </div>
        </div>

        {/* Primary Movies Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {renderSkeletons(10)}
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-24 bg-zinc-900/20 border border-zinc-900/60 rounded-3xl p-8 max-w-xl mx-auto glass-card flex flex-col items-center gap-4">
            <span className="text-4xl">🎬</span>
            <h4 className="text-xl font-bold">No movies matched your criteria</h4>
            <p className="text-zinc-500 text-sm max-w-xs leading-relaxed">
              We couldn't locate any matching cinematic films in this section. Try resetting filters or adjust search criteria.
            </p>
            <button
              onClick={clearSearchOrFilters}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition"
            >
              Clear All Queries
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {movies.map((movie) => (
                <div
                  key={movie.imdbID}
                  onClick={() => navigate(`/movie/${movie.imdbID}`)}
                  className="bg-zinc-900/30 border border-zinc-900/80 rounded-2xl overflow-hidden shadow-lg hover:shadow-red-950/20 transition duration-300 cursor-pointer group flex flex-col justify-between h-full hover:scale-[1.03] hover:border-zinc-800 glass-card"
                >
                  <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-950">
                    {/* Poster */}
                    <img
                      src={movie.Poster !== 'N/A' && movie.Poster ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Image'}
                      alt={movie.Title}
                      className="w-full h-full object-cover group-hover:scale-102 transition duration-500"
                      loading="lazy"
                    />

                    {/* Bookmark Indicator overlay */}
                    {movie.Rating && movie.Rating !== 'N/A' && (
                      <span className="absolute top-3 left-3 bg-black/75 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-black tracking-wider flex items-center gap-1 border border-zinc-800">
                        <span className="text-yellow-400">★</span> {movie.Rating}
                      </span>
                    )}

                    {/* Quick overlay controls */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition duration-200 flex items-center justify-center gap-3">
                      <button
                        onClick={(e) => addToWatchlist(e, movie)}
                        className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg hover:scale-110 active:scale-90 transition cursor-pointer"
                        title="Add to Watchlist"
                      >
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                          <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="p-4 flex flex-col justify-between flex-grow">
                    <div>
                      <h4 className="font-extrabold text-sm tracking-wide text-zinc-100 group-hover:text-red-400 transition truncate" title={movie.Title}>
                        {movie.Title}
                      </h4>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-zinc-500 text-xs font-bold bg-zinc-950 px-2 py-0.5 rounded-md border border-zinc-900">{movie.Year}</span>
                        {movie.Rating && movie.Rating !== 'N/A' && (
                          <span className={`text-xs ${getRatingColor(movie.Rating)}`}>
                            ★ {movie.Rating}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={(e) => addToWatchlist(e, movie)}
                      className="w-full mt-4 bg-zinc-900 hover:bg-red-600 text-zinc-300 hover:text-white py-2 rounded-xl text-xs font-bold transition duration-200 flex items-center justify-center gap-1.5 border border-zinc-800 hover:border-transparent active:scale-95 cursor-pointer"
                    >
                      + Save Watchlist
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > page && !searchParams.get('search') && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={loadNextPage}
                  disabled={loadingMore}
                  className="bg-zinc-900 hover:bg-zinc-850 text-white font-extrabold px-10 py-4 rounded-xl transition duration-200 border border-zinc-800 disabled:opacity-50 flex items-center gap-2 cursor-pointer text-sm"
                >
                  {loadingMore ? (
                    <>
                      <div className="w-4 h-4 border-2 border-transparent border-t-white rounded-full animate-spin" />
                      Loading Next Page...
                    </>
                  ) : (
                    'Load More Movies'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Global Toast Alerts */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Global Embedded YouTube Trailer Player */}
      {activeTrailer && (
        <VideoModal
          videoUrl={activeTrailer}
          onClose={() => setActiveTrailer(null)}
        />
      )}
    </div>
  )
}

export default Dashboard