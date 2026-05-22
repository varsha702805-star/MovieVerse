import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import Navbar from '../components/Navbar'
import Toast from '../components/Toast'

function Watchlist() {
  const navigate = useNavigate()
  
  // State variables
  const [watchlist, setWatchlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [matchedMovie, setMatchedMovie] = useState(null)
  const [isMatching, setIsMatching] = useState(false)
  const [toast, setToast] = useState(null)

  // Auth Protection Check
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/')
    } else {
      fetchWatchlist()
    }
  }, [navigate])

  const fetchWatchlist = async () => {
    try {
      setLoading(true)
      const res = await api.get('/watchlist')
      setWatchlist(res.data || [])
    } catch (err) {
      console.error('Failed to fetch watchlist:', err)
      showToast('Error loading your watchlist.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const removeFromWatchlist = async (e, id, title) => {
    e.stopPropagation() // Avoid card click details navigation
    try {
      await api.delete(`/watchlist/${id}`)
      setWatchlist((prev) => prev.filter((item) => item.id !== id))
      showToast(`"${title}" removed from watchlist.`, 'info')
      
      // Reset match if removed active match
      if (matchedMovie && matchedMovie.id === id) {
        setMatchedMovie(null)
      }
    } catch (err) {
      console.error('Failed to remove from watchlist:', err)
      showToast('Failed to remove movie. Please try again.', 'error')
    }
  }

  // "Surprise Me / Movie Matcher" core logic
  const handleSurpriseMatch = () => {
    if (watchlist.length === 0) {
      showToast('Add movies to your watchlist first!', 'warning')
      return
    }

    setIsMatching(true)
    setMatchedMovie(null)

    // Sleek micro-animation timer to simulate a randomizer cycle
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * watchlist.length)
      setMatchedMovie(watchlist[randomIndex])
      setIsMatching(false)
      showToast('Popcorn is ready! We matched a movie for you.', 'success')
    }, 1200)
  }

  const showToast = (message, type) => {
    setToast({ message, type })
  }

  // Skeleton grid shimmer loader
  const renderSkeletons = (count = 5) => {
    return Array.from({ length: count }).map((_, index) => (
      <div key={index} className="bg-zinc-900/40 border border-zinc-900 rounded-2xl overflow-hidden shadow-lg h-[350px] flex flex-col justify-between animate-shimmer">
        <div className="w-full h-64 bg-zinc-800/20" />
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div className="h-5 bg-zinc-800 rounded-lg w-10/12 mb-2" />
          <div className="h-8 bg-zinc-800 rounded-lg w-full" />
        </div>
      </div>
    ))
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-16 animate-fade-in">
      <Navbar />

      <div className="pt-28 px-6 md:px-8 max-w-7xl mx-auto">
        
        {/* Watchlist Header Info */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-zinc-900 mb-8">
          <div>
            <h2 className="text-4xl font-black mb-1.5 flex items-center gap-2">
              My Personal Watchlist
            </h2>
            <p className="text-zinc-500 text-sm font-semibold">
              You have accumulated <span className="text-red-500 font-extrabold">{watchlist.length}</span> curations in your vault.
            </p>
          </div>

          {watchlist.length > 0 && (
            <button
              onClick={handleSurpriseMatch}
              disabled={isMatching}
              className="bg-red-650 hover:bg-red-600 border border-red-500/25 text-white font-extrabold px-6 py-3 rounded-xl transition duration-200 glow-btn-red flex items-center gap-2 active:scale-95 text-sm tracking-wide disabled:opacity-50 cursor-pointer"
            >
              <span>🍿</span>
              {isMatching ? 'Matching Movie...' : 'Surprise Me! (Movie Matcher)'}
            </button>
          )}
        </div>

        {/* Surprise Movie Spotlight Box */}
        {matchedMovie && (
          <div className="mb-10 bg-gradient-to-r from-red-950/20 via-zinc-900/40 to-zinc-900/20 border border-red-500/20 p-6 rounded-3xl animate-slide-in flex flex-col md:flex-row items-center gap-6 glass-card shadow-xl relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setMatchedMovie(null)}
                className="text-zinc-500 hover:text-white p-1 hover:bg-zinc-800 rounded-lg transition"
              >
                ✕
              </button>
            </div>
            
            <img
              src={matchedMovie.poster !== 'N/A' ? matchedMovie.poster : 'https://via.placeholder.com/300x450?text=No+Image'}
              alt={matchedMovie.title}
              className="w-24 md:w-28 rounded-xl object-cover border border-zinc-800 shadow-md flex-shrink-0"
            />
            
            <div className="text-center md:text-left flex-1">
              <span className="text-red-400 text-[10px] font-black uppercase tracking-widest bg-red-950/40 border border-red-500/30 px-2 py-0.5 rounded-md">
                Tonight's Spotlight Match
              </span>
              <h3 className="text-2xl font-black text-white mt-1.5">{matchedMovie.title}</h3>
              <p className="text-zinc-400 text-xs mt-1 max-w-xl">
                Stuck in decision paralysis? Popcorn is ready! We selected this film from your watchlist. Hit watch details to explore trailer and cast!
              </p>
              
              <div className="flex gap-3 mt-4 justify-center md:justify-start">
                <button
                  onClick={() => navigate(`/movie/${matchedMovie.movieId}`)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2 rounded-xl text-xs transition duration-200 cursor-pointer"
                >
                  View Details & Trailer
                </button>
                <button
                  onClick={() => setMatchedMovie(null)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold px-5 py-2 rounded-xl text-xs transition duration-200 cursor-pointer"
                >
                  Dismiss Recommendation
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Watchlist Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {renderSkeletons(10)}
          </div>
        ) : watchlist.length === 0 ? (
          <div className="text-center py-28 bg-zinc-900/20 border border-zinc-900/60 rounded-3xl p-8 max-w-xl mx-auto glass-card flex flex-col items-center gap-4 animate-fade-in">
            <span className="text-5xl">📂</span>
            <h3 className="text-2xl font-bold">Your Watchlist is empty</h3>
            <p className="text-zinc-500 text-sm max-w-xs leading-relaxed">
              Explore trending collections, search databases, and bookmark titles to organize your viewing dashboard list.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-red-600 hover:bg-red-700 text-white font-extrabold px-8 py-3 rounded-xl transition duration-200 active:scale-95 text-sm tracking-wide shadow-lg cursor-pointer"
            >
              Browse Films Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-fade-in">
            {watchlist.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/movie/${item.movieId}`)}
                className="bg-zinc-900/30 border border-zinc-900/80 rounded-2xl overflow-hidden shadow-lg hover:shadow-red-950/20 transition duration-300 cursor-pointer group flex flex-col justify-between h-full hover:scale-[1.03] hover:border-zinc-800 glass-card"
              >
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-950">
                  <img
                    src={item.poster !== 'N/A' && item.poster ? item.poster : 'https://via.placeholder.com/300x450?text=No+Image'}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition duration-500"
                    loading="lazy"
                  />
                  {/* Remove hover visual trigger overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition duration-200 flex items-center justify-center">
                    <button
                      onClick={(e) => removeFromWatchlist(e, item.id, item.title)}
                      className="bg-rose-650 hover:bg-rose-600 text-white p-3.5 rounded-full shadow-lg hover:scale-110 active:scale-90 transition duration-200 cursor-pointer"
                      title="Remove from Watchlist"
                    >
                      <svg className="w-5 h-5 fill-none stroke-current" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-4 flex flex-col justify-between flex-grow">
                  <h4 className="font-extrabold text-sm tracking-wide text-zinc-100 group-hover:text-red-400 transition truncate" title={item.title}>
                    {item.title}
                  </h4>

                  <button
                    onClick={(e) => removeFromWatchlist(e, item.id, item.title)}
                    className="w-full mt-4 bg-zinc-900 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-400 py-2 rounded-xl text-xs font-bold transition duration-200 flex items-center justify-center gap-1.5 border border-zinc-800 hover:border-rose-900/50 active:scale-95 cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7" />
                    </svg>
                    Remove Selection
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast Alert Popups */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

export default Watchlist