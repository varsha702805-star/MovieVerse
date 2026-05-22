import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import Navbar from '../components/Navbar'
import Toast from '../components/Toast'

function Profile() {
  const navigate = useNavigate()

  // State variables
  const [user, setUser] = useState(null)
  const [watchlist, setWatchlist] = useState([])
  const [reviews, setReviews] = useState([])
  const [ratings, setRatings] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('watchlist')
  const [toast, setToast] = useState(null)
  
  // Avatar state
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false)
  const [customAvatarUrl, setCustomAvatarUrl] = useState('')

  const PRESET_AVATARS = [
    { id: 'maestro', name: 'Popcorn Maestro', url: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&q=80&w=150' },
    { id: 'cyberpunk', name: 'Sci-Fi Cyberpunk', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=150' },
    { id: 'noir', name: 'Noir Detective', url: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&q=80&w=150' },
    { id: 'director', name: 'Hollywood Director', url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=150' },
    { id: 'hero', name: 'Super Hero', url: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&q=80&w=150' },
    { id: 'anime', name: 'Anime Hero', url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=150' },
  ]

  const handleSaveAvatar = async (url) => {
    if (!url.trim()) {
      showToast('Please select or enter a valid URL.', 'warning')
      return
    }
    try {
      await api.put('/auth/profile/avatar', { avatar: url.trim() })
      setUser((prev) => ({ ...prev, avatar: url.trim() }))
      setIsAvatarModalOpen(false)
      setCustomAvatarUrl('')
      showToast('Profile picture updated successfully!', 'success')
    } catch (err) {
      console.error('Failed to save avatar:', err)
      showToast('Failed to update profile picture.', 'error')
    }
  }

  // Computed variables
  const ratedMovies = Object.keys(ratings)
  const averageRating = ratedMovies.length > 0
    ? (ratedMovies.reduce((acc, curr) => acc + ratings[curr].rating, 0) / ratedMovies.length).toFixed(1)
    : '0.0'

  // Estimate watch hours based on watchlist + rated movies (avg 112 mins each)
  const totalEstimatedMovies = watchlist.length + ratedMovies.length
  const estimatedHours = ((totalEstimatedMovies * 112) / 60).toFixed(1)

  // Compute Reviewer Tier
  const getCinephileTier = () => {
    const score = watchlist.length + ratedMovies.length + reviews.length
    if (score >= 20) return { name: 'Master Critic', style: 'text-red-400 border-red-500/30 bg-red-950/20' }
    if (score >= 8) return { name: 'Cinephile Elite', style: 'text-amber-400 border-amber-500/30 bg-amber-950/20' }
    return { name: 'Cinema Enthusiast', style: 'text-zinc-400 border-zinc-800 bg-zinc-900/60' }
  }

  const tier = getCinephileTier()

  // Strict session redirection check
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/')
    } else {
      fetchUserData()
    }
  }, [navigate])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      // Fetch Profile
      const profileRes = await api.get('/auth/profile')
      setUser(profileRes.data)

      // Fetch Watchlist
      const watchlistRes = await api.get('/watchlist')
      setWatchlist(watchlistRes.data || [])

      // Fetch Reviews written by user
      const reviewsRes = await api.get('/reviews/user')
      setReviews(reviewsRes.data || [])

      // Load Ratings from localStorage
      const savedRatings = localStorage.getItem('ratings')
      if (savedRatings) {
        setRatings(JSON.parse(savedRatings))
      }
    } catch (err) {
      console.error('Failed to load profile details:', err)
      showToast('Error syncing user profile.', 'error')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteReview = async (reviewId) => {
    try {
      await api.delete(`/reviews/${reviewId}`)
      setReviews((prev) => prev.filter((r) => r.id !== reviewId))
      showToast('Your movie review was deleted successfully.', 'info')
    } catch (err) {
      console.error('Failed to delete review:', err)
      showToast('Failed to delete review.', 'error')
    }
  }

  const showToast = (message, type) => {
    setToast({ message, type })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center gap-4 animate-fade-in">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-zinc-900" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-600 animate-spin" />
        </div>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest animate-pulse">Syncing Cinematic Space</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20 animate-fade-in">
      <Navbar />

      {/* Cinematic Profile Banner Canvas Header */}
      <div className="relative h-[280px] w-full overflow-hidden bg-black">
        {/* Cover Collage image overlay */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1920')] bg-cover bg-center opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-black/35" />
      </div>

      {/* Profile Details segment */}
      <div className="max-w-5xl mx-auto px-6 -mt-20 relative z-10">
        
        {/* Avatar & Name Info Grid */}
        <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 mb-8 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-5">
            {/* avatar glowing monogram */}
            <div
              onClick={() => setIsAvatarModalOpen(true)}
              className="w-28 h-28 bg-red-650 rounded-full flex items-center justify-center text-4xl font-black text-white border-4 border-zinc-950 shadow-2xl relative select-none group glow-red shrink-0 cursor-pointer overflow-hidden"
              title="Click to change profile picture"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover group-hover:scale-110 transition duration-300" />
              ) : (
                user?.name?.charAt(0).toUpperCase()
              )}
              {/* hover overlay edit icon */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition duration-200 flex items-center justify-center text-xs font-bold tracking-wider text-white">
                Edit Pic
              </div>
              {/* breathing pulse ring */}
              <div className="absolute inset-0 rounded-full border border-red-500/60 animate-ping opacity-30 pointer-events-none" />
            </div>
            
            <div className="mb-2">
              <span className={`inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${tier.style}`}>
                {tier.name}
              </span>
              <h2 className="text-3xl font-black mt-2 text-zinc-100 tracking-tight glow-red">
                {user?.name}
              </h2>
              <p className="text-zinc-400 text-sm mt-0.5 font-medium">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap justify-center mb-2">
            <div className="bg-zinc-900/60 border border-zinc-800/80 px-4 py-2.5 rounded-2xl backdrop-blur-sm shadow text-center min-w-[80px]">
              <span className="block text-2xl font-black text-red-500">{watchlist.length}</span>
              <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Watchlist</span>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800/80 px-4 py-2.5 rounded-2xl backdrop-blur-sm shadow text-center min-w-[80px]">
              <span className="block text-2xl font-black text-red-500">{ratedMovies.length}</span>
              <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Ratings</span>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800/80 px-4 py-2.5 rounded-2xl backdrop-blur-sm shadow text-center min-w-[80px]">
              <span className="block text-2xl font-black text-red-500">{reviews.length}</span>
              <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Reviews</span>
            </div>
          </div>
        </div>

        {/* Analytics & Stats visual widgets dashboard grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          
          {/* Watch Journey stats */}
          <div className="bg-zinc-900/30 border border-zinc-900 rounded-3xl p-6 glass-card shadow-lg flex flex-col justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Watch Journey</h3>
            <div className="space-y-4">
              <div>
                <span className="text-xs text-zinc-500 block font-medium">Estimated Cine-Time</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-black text-red-500">{estimatedHours}</span>
                  <span className="text-sm font-bold text-zinc-400">Hours</span>
                </div>
              </div>
              <div className="pt-2 border-t border-zinc-900/60">
                <span className="text-xs text-zinc-500 block font-medium">Average Score Given</span>
                <div className="flex items-center gap-1.5 mt-1 text-yellow-400 font-extrabold text-2xl">
                  ★ {averageRating}
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Genre Breakdown Bar Chart list */}
          <div className="bg-zinc-900/30 border border-zinc-900 rounded-3xl p-6 glass-card shadow-lg md:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Genre Metrics breakdown</h3>
            
            <div className="space-y-3.5">
              {/* Simulated active genre breakdown stats */}
              <div>
                <div className="flex justify-between text-xs font-bold text-zinc-300 mb-1">
                  <span>Action / Thriller</span>
                  <span className="text-red-400">45%</span>
                </div>
                <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-900">
                  <div className="bg-red-500 h-full rounded-full" style={{ width: '45%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-zinc-300 mb-1">
                  <span>Drama / Romance</span>
                  <span className="text-red-400">30%</span>
                </div>
                <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-900">
                  <div className="bg-red-500/80 h-full rounded-full" style={{ width: '30%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-zinc-300 mb-1">
                  <span>Sci-Fi / Horror</span>
                  <span className="text-red-400">25%</span>
                </div>
                <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-900">
                  <div className="bg-red-650 h-full rounded-full" style={{ width: '25%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selection Header */}
        <div className="flex border-b border-zinc-900 mb-6 gap-2">
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`px-5 py-3.5 font-bold text-sm tracking-wide border-b-2 transition duration-200 cursor-pointer ${
              activeTab === 'watchlist'
                ? 'border-red-500 text-red-400 font-extrabold'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            Saved Watchlist ({watchlist.length})
          </button>
          <button
            onClick={() => setActiveTab('ratings')}
            className={`px-5 py-3.5 font-bold text-sm tracking-wide border-b-2 transition duration-200 cursor-pointer ${
              activeTab === 'ratings'
                ? 'border-red-500 text-red-400 font-extrabold'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            My Ratings Log ({ratedMovies.length})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-5 py-3.5 font-bold text-sm tracking-wide border-b-2 transition duration-200 cursor-pointer ${
              activeTab === 'reviews'
                ? 'border-red-500 text-red-400 font-extrabold'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            Written Reviews ({reviews.length})
          </button>
        </div>

        {/* Tab Contents */}
        <div className="min-h-[200px] animate-fade-in">
          
          {/* Watchlist Tab content */}
          {activeTab === 'watchlist' && (
            watchlist.length === 0 ? (
              <div className="text-center py-10 bg-zinc-900/10 border border-zinc-900/60 p-6 rounded-2xl glass-card max-w-sm mx-auto">
                <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-3">Watchlist is clean</p>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
                >
                  Find Movies to Save
                </button>
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-4 scroll-smooth">
                {watchlist.map((item) => (
                  <div
                    key={`watchlist-${item.id}`}
                    onClick={() => navigate(`/movie/${item.movieId}`)}
                    className="flex-shrink-0 w-36 bg-zinc-900 rounded-xl overflow-hidden hover:scale-102 transition duration-300 cursor-pointer border border-zinc-900 hover:border-zinc-800 group shadow-lg"
                  >
                    <img
                      src={item.poster !== 'N/A' ? item.poster : 'https://via.placeholder.com/150x225?text=No+Image'}
                      alt={item.title}
                      className="w-full h-48 object-cover group-hover:opacity-85 transition"
                      loading="lazy"
                    />
                    <div className="p-2 truncate text-center">
                      <h4 className="font-extrabold text-[11px] text-zinc-100 group-hover:text-red-400 transition truncate">{item.title}</h4>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Ratings Tab content */}
          {activeTab === 'ratings' && (
            ratedMovies.length === 0 ? (
              <div className="text-center py-10 bg-zinc-900/10 border border-zinc-900/60 p-6 rounded-2xl glass-card max-w-sm mx-auto">
                <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest">No ratings logged yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ratedMovies.map((movieId) => (
                  <div
                    key={`rating-${movieId}`}
                    onClick={() => navigate(`/movie/${movieId}`)}
                    className="bg-zinc-900/30 border border-zinc-900 p-4 rounded-2xl glass-card flex justify-between items-center hover:border-zinc-800 transition duration-200 cursor-pointer"
                  >
                    <div className="truncate pr-4">
                      <h4 className="font-extrabold text-sm text-zinc-200 truncate">{ratings[movieId].title}</h4>
                      <span className="text-[10px] text-zinc-500 block mt-0.5">Local Log Record</span>
                    </div>

                    <div className="flex gap-0.5 text-sm shrink-0">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={star <= ratings[movieId].rating ? 'text-yellow-400' : 'text-zinc-700'}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Reviews Tab content */}
          {activeTab === 'reviews' && (
            reviews.length === 0 ? (
              <div className="text-center py-10 bg-zinc-900/10 border border-zinc-900/60 p-6 rounded-2xl glass-card max-w-sm mx-auto animate-fade-in">
                <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest">No reviews written yet</p>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-zinc-900/30 border border-zinc-900 p-6 rounded-2xl glass-card flex flex-col justify-between gap-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4
                          onClick={() => navigate(`/movie/${review.movieId}`)}
                          className="font-extrabold text-base text-zinc-100 hover:text-red-400 cursor-pointer transition"
                        >
                          {review.title}
                        </h4>
                        <span className="text-[10px] text-zinc-500 font-semibold block mt-0.5">
                          Published {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex gap-0.5 text-xs text-yellow-400 font-bold shrink-0">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-zinc-700'}>★</span>
                        ))}
                      </div>
                    </div>

                    <p className="text-zinc-400 text-sm leading-relaxed border-l-2 border-red-600/30 pl-4 py-1 italic font-medium">
                      "{review.content}"
                    </p>

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="bg-zinc-950 hover:bg-rose-950/30 text-zinc-500 hover:text-rose-400 px-3.5 py-1.5 rounded-lg text-xs font-bold transition duration-200 border border-zinc-900 hover:border-rose-900/30 active:scale-95 cursor-pointer flex items-center gap-1.5"
                      >
                        <svg className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7" />
                        </svg>
                        Delete Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* Avatar Customization Modal overlay */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-900 w-full max-w-lg rounded-3xl p-6 shadow-2xl animate-slide-in relative glass-panel">
            <button
              onClick={() => {
                setIsAvatarModalOpen(false)
                setCustomAvatarUrl('')
              }}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white p-1 hover:bg-zinc-900 rounded-lg transition"
            >
              ✕
            </button>
            <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Choose Profile Picture</h3>
            <p className="text-zinc-500 text-xs font-semibold mb-6">Select a cinematic character identity or paste a custom image link.</p>

            {/* Presets Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {PRESET_AVATARS.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => handleSaveAvatar(avatar.url)}
                  className="flex flex-col items-center gap-2 group focus:outline-none"
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-zinc-800 hover:border-red-600 transition group-hover:scale-105 duration-200">
                    <img src={avatar.url} alt={avatar.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[10px] font-bold text-zinc-400 group-hover:text-white text-center transition truncate w-full">{avatar.name}</span>
                </button>
              ))}
            </div>

            {/* Custom URL Input */}
            <div className="border-t border-zinc-900 pt-6">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-2">Custom Image URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://example.com/your-avatar.jpg"
                  value={customAvatarUrl}
                  onChange={(e) => setCustomAvatarUrl(e.target.value)}
                  className="flex-1 bg-zinc-900/60 border border-zinc-800 text-white px-4 py-2.5 rounded-xl outline-none focus:border-red-600 transition text-sm font-semibold"
                />
                <button
                  onClick={() => handleSaveAvatar(customAvatarUrl)}
                  className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-xs font-extrabold transition active:scale-95 glow-btn-red"
                >
                  Save URL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Alert popups */}
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

export default Profile