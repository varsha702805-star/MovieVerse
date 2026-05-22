import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../utils/api'
import Navbar from '../components/Navbar'
import Toast from '../components/Toast'
import VideoModal from '../components/VideoModal'

function MovieDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  // State variables
  const [movie, setMovie] = useState(null)
  const [similarMovies, setSimilarMovies] = useState([])
  const [dbReviews, setDbReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [similarLoading, setSimilarLoading] = useState(true)
  const [reviewsLoading, setReviewsLoading] = useState(true)
  
  // Star rating & review input form
  const [localRating, setLocalRating] = useState(0)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [submittingReview, setSubmittingReview] = useState(false)
  
  // UI states
  const [error, setError] = useState(false)
  const [activeTrailer, setActiveTrailer] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    fetchMovieData()
    loadLocalRating()
    fetchMovieReviews()
    fetchSimilarMovies()
  }, [id])

  const fetchMovieData = async () => {
    try {
      setLoading(true)
      setError(false)
      const res = await api.get(`/movies/details/${id}`)
      if (res.data && res.data.Title) {
        setMovie(res.data)
      } else {
        setError(true)
      }
    } catch (err) {
      console.error('Failed to fetch movie details:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const fetchSimilarMovies = async () => {
    try {
      setSimilarLoading(true)
      const res = await api.get(`/movies/details/${id}/similar`)
      setSimilarMovies(res.data.Search || [])
    } catch (err) {
      console.error('Failed to fetch similar movies:', err)
    } finally {
      setSimilarLoading(false)
    }
  }

  const fetchMovieReviews = async () => {
    try {
      setReviewsLoading(true)
      const res = await api.get(`/reviews/movie/${id}`)
      setDbReviews(res.data || [])
    } catch (err) {
      console.error('Failed to fetch movie database reviews:', err)
    } finally {
      setReviewsLoading(false)
    }
  }

  const loadLocalRating = () => {
    const saved = JSON.parse(localStorage.getItem('ratings') || '{}')
    if (saved[id]) {
      setLocalRating(saved[id].rating)
    } else {
      setLocalRating(0)
    }
  }

  const handleLocalRating = (star) => {
    setLocalRating(star)
    const saved = JSON.parse(localStorage.getItem('ratings') || '{}')
    saved[id] = { rating: star, title: movie.Title }
    localStorage.setItem('ratings', JSON.stringify(saved))
    showToast(`You rated this film ${star}/5 stars!`, 'success')
  }

  const handlePublishReview = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    if (!token) {
      showToast('Please sign in to write a movie review.', 'warning')
      navigate('/')
      return
    }

    if (!reviewText.trim()) {
      showToast('Review content cannot be empty.', 'warning')
      return
    }

    try {
      setSubmittingReview(true)
      const res = await api.post('/reviews', {
        movieId: String(id),
        title: movie.Title,
        rating: reviewRating,
        content: reviewText.trim()
      })
      
      // Update reviews list and reset inputs
      setDbReviews((prev) => [res.data, ...prev])
      setReviewText('')
      setReviewRating(5)
      showToast('Your review was successfully published!', 'success')
    } catch (err) {
      console.error('Failed to post review:', err)
      showToast('Failed to post review. Please try again.', 'error')
    } finally {
      setSubmittingReview(false)
    }
  }

  const addToWatchlist = async () => {
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
        poster: movie.Poster
      })
      showToast(`"${movie.Title}" added to watchlist!`, 'success')
    } catch (err) {
      showToast('Movie is already in your watchlist!', 'info')
    }
  }

  const showToast = (message, type) => {
    setToast({ message, type })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 animate-fade-in">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-zinc-900" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-600 animate-spin" />
        </div>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest animate-pulse">Scanning Film Reel</p>
      </div>
    )
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center gap-4 animate-fade-in">
        <p className="text-zinc-400 text-xl font-bold">Film curations not found</p>
        <button
          onClick={() => navigate(-1)}
          className="bg-red-650 hover:bg-red-600 border border-red-500/20 text-white px-6 py-2.5 rounded-xl font-bold transition duration-200 active:scale-95 text-sm cursor-pointer"
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20 animate-fade-in relative">
      <Navbar />

      {/* Blurred Backdrop image overlay canvas */}
      <div className="absolute top-0 left-0 w-full h-[50vh] overflow-hidden z-0 pointer-events-none select-none">
        <img
          src={movie.Poster !== 'N/A' ? movie.Poster : ''}
          alt=""
          className="w-full h-full object-cover blur-[80px] opacity-20 brightness-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
      </div>

      <div className="pt-28 max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        
        {/* Navigation Breadcrumb */}
        <button
          onClick={() => navigate(-1)}
          className="text-zinc-400 hover:text-white mb-8 flex items-center gap-2 transition font-bold text-sm bg-zinc-900/60 border border-zinc-800/80 px-4 py-2 rounded-xl active:scale-95 cursor-pointer backdrop-blur-sm shadow-md"
        >
          ← Go Back
        </button>

        {/* Main Details layout */}
        <div className="flex flex-col md:flex-row gap-10 mb-16 items-start">
          {/* Movie Poster */}
          <div className="w-full md:w-80 flex-shrink-0 group relative rounded-2xl overflow-hidden shadow-2xl border border-zinc-850/60 aspect-[2/3] bg-zinc-950">
            <img
              src={movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Image'}
              alt={movie.Title}
              className="w-full h-full object-cover group-hover:scale-102 transition duration-500"
            />
            
            {/* Quick rating indicator absolute badge */}
            {movie.imdbRating && movie.imdbRating !== 'N/A' && (
              <span className="absolute top-4 left-4 bg-yellow-500/10 border border-yellow-500/40 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-black tracking-wider text-yellow-400">
                ★ IMDB {movie.imdbRating}
              </span>
            )}
          </div>

          {/* Metadata content details */}
          <div className="flex-1 space-y-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black mb-3 text-zinc-100 tracking-tight leading-none glow-red">
                {movie.Title}
              </h1>
              
              <div className="flex gap-3 text-xs text-zinc-400 font-bold items-center flex-wrap">
                <span className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl text-zinc-300">{movie.Year}</span>
                <span className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl text-zinc-300">{movie.Runtime}</span>
                <span className="bg-red-950/20 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-xl uppercase tracking-wider">{movie.Genre}</span>
                {movie.Language && (
                  <span className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl text-zinc-300 uppercase tracking-widest">{movie.Language}</span>
                )}
              </div>
            </div>

            <div className="bg-zinc-900/30 border border-zinc-900 p-6 rounded-3xl glass-card relative overflow-hidden shadow">
              <p className="text-zinc-300 text-sm md:text-base leading-relaxed font-medium">
                {movie.Plot !== 'N/A' ? movie.Plot : 'No movie synopsis available in the current archive records.'}
              </p>
            </div>

            {/* Grid specifications */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-zinc-900/10 border border-zinc-900 rounded-3xl p-6 glass-card shadow-sm text-sm">
              <div>
                <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest block mb-0.5">Director</span>
                <p className="font-bold text-zinc-200">{movie.Director}</p>
              </div>
              <div>
                <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest block mb-0.5">Cast Starring</span>
                <p className="font-bold text-zinc-200">{movie.Actors}</p>
              </div>
              <div>
                <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest block mb-0.5">TMDb Score Info</span>
                <p className="font-bold text-zinc-200">{movie.Awards}</p>
              </div>
            </div>

            {/* Star Rating selection */}
            <div className="bg-zinc-900/30 border border-zinc-900 rounded-3xl p-6 glass-card shadow-sm w-full max-w-sm">
              <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest block mb-2.5">Your star rating</span>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleLocalRating(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    className={`text-3xl transition duration-150 transform active:scale-90 hover:scale-110 cursor-pointer ${
                      star <= (hoveredStar || localRating) ? 'text-yellow-400' : 'text-zinc-700'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
              {localRating > 0 && (
                <p className="text-zinc-500 text-xs mt-2.5 font-bold">You logged this film {localRating}/5 stars.</p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-4 flex-wrap pt-2">
              <button
                onClick={addToWatchlist}
                className="bg-red-650 hover:bg-red-600 border border-red-500/20 text-white px-8 py-3.5 rounded-xl font-black transition duration-200 glow-btn-red active:scale-95 text-sm tracking-wide shadow-lg flex items-center justify-center gap-2 cursor-pointer flex-1 sm:flex-initial"
              >
                + Add to Watchlist
              </button>

              {movie.Trailer && (
                <button
                  onClick={() => setActiveTrailer(movie.Trailer)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-3.5 rounded-xl font-black transition duration-200 border border-zinc-750 flex items-center justify-center gap-2 active:scale-95 text-sm tracking-wide cursor-pointer flex-1 sm:flex-initial"
                >
                  <svg className="w-5 h-5 text-red-500 fill-current" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Watch trailer
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Reviews and User Comments section (Module 1) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16 border-t border-zinc-900 pt-12 items-start">
          {/* Write a review form */}
          <div className="bg-zinc-900/30 border border-zinc-900 p-6 rounded-3xl glass-card shadow-lg lg:col-span-1">
            <h3 className="text-lg font-black tracking-wide text-zinc-100 mb-2.5">Publish Movie Review</h3>
            <p className="text-zinc-500 text-xs font-semibold leading-relaxed mb-6">
              Write your cinematic critique and ratings below to publish onto the local film board and your profile dashboard.
            </p>

            <form onSubmit={handlePublishReview} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-2 uppercase tracking-widest">Select score</label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={`review-star-${star}`}
                      onClick={() => setReviewRating(star)}
                      className={`text-2xl transition hover:scale-105 cursor-pointer ${
                        star <= reviewRating ? 'text-yellow-400' : 'text-zinc-700'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-2 uppercase tracking-widest">Review Content</label>
                <textarea
                  rows="4"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your cinematic critique, thoughts, or comments..."
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-3.5 text-sm text-zinc-200 outline-none focus:border-red-600 transition placeholder-zinc-600 font-semibold"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-3.5 rounded-xl text-sm transition duration-200 active:scale-98 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer glow-btn-red"
              >
                {submittingReview ? (
                  <>
                    <div className="w-4 h-4 border-2 border-transparent border-t-white rounded-full animate-spin" />
                    Publishing...
                  </>
                ) : (
                  'Publish Critique 🔥'
                )}
              </button>
            </form>
          </div>

          {/* Critique Timeline Board */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-extrabold text-zinc-200 tracking-wide flex items-center gap-2 mb-4">
              <span className="w-1.5 h-6 bg-red-600 rounded-full" />
              Cinematic Critique Board ({dbReviews.length})
            </h3>

            {reviewsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-28 bg-zinc-900 animate-shimmer rounded-2xl" />
                ))}
              </div>
            ) : dbReviews.length === 0 ? (
              <div className="text-center py-12 bg-zinc-900/10 border border-zinc-900 rounded-2xl p-6 glass-card">
                <span className="text-3xl block mb-2">✍️</span>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Critique Board is clean</p>
                <p className="text-zinc-650 text-xs mt-1">Be the first to publish a review for this curation!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {dbReviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-zinc-900/30 border border-zinc-900 p-5 rounded-2xl glass-card animate-fade-in flex items-start gap-4 shadow-sm"
                  >
                    {/* User monogram avatar */}
                    <div className="w-10 h-10 bg-zinc-800 border border-zinc-700/60 rounded-full flex items-center justify-center text-sm font-black text-red-500 shrink-0 select-none">
                      {review.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <div className="flex justify-between items-center gap-4 flex-wrap">
                        <div>
                          <h4 className="font-extrabold text-sm text-zinc-200">{review.user?.name || 'Anonymous User'}</h4>
                          <span className="text-[10px] text-zinc-500 font-semibold block mt-0.5">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex gap-0.5 text-xs text-yellow-400 shrink-0">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-zinc-700'}>★</span>
                          ))}
                        </div>
                      </div>

                      <p className="text-zinc-400 text-sm leading-relaxed font-semibold italic">
                        "{review.content}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Similar Movie Recommendations row (Module 2) */}
        {similarMovies.length > 0 && (
          <div className="border-t border-zinc-900 pt-12 animate-fade-in">
            <h3 className="text-xl font-extrabold text-zinc-200 tracking-wide flex items-center gap-2 mb-6">
              <span className="w-1.5 h-6 bg-red-600 rounded-full" />
              Similar Movie Recommendations
            </h3>
            
            {similarLoading ? (
              <div className="flex gap-4 overflow-x-auto pb-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-40 h-60 rounded-2xl bg-zinc-900 animate-shimmer" />
                ))}
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-4 scroll-smooth">
                {similarMovies.map((movie) => (
                  <div
                    key={`similar-${movie.imdbID}`}
                    onClick={() => navigate(`/movie/${movie.imdbID}`)}
                    className="flex-shrink-0 w-40 bg-zinc-900 rounded-2xl overflow-hidden hover:scale-105 transition duration-300 cursor-pointer shadow-lg group border border-zinc-900 hover:border-zinc-800"
                  >
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-950">
                      <img
                        src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/150x225?text=No+Image'}
                        alt={movie.Title}
                        className="w-full h-full object-cover group-hover:scale-102 transition duration-500"
                        loading="lazy"
                      />
                      {/* Hover details overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition duration-200 flex flex-col justify-end p-3">
                        <span className="text-yellow-400 text-[10px] font-bold mb-1">★ {movie.Rating || 'N/A'}</span>
                        <h4 className="font-extrabold text-[10px] text-white truncate">{movie.Title}</h4>
                        <p className="text-[9px] text-zinc-400 mt-0.5">{movie.Year}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Global Toast Alert Message element */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Embedded trailer Video player modal */}
      {activeTrailer && (
        <VideoModal
          videoUrl={activeTrailer}
          onClose={() => setActiveTrailer(null)}
        />
      )}
    </div>
  )
}

export default MovieDetails