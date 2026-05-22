import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import Navbar from '../components/Navbar'
import Toast from '../components/Toast'

function Achievements() {
  const navigate = useNavigate()
  
  // Data States
  const [user, setUser] = useState(null)
  const [watchlistCount, setWatchlistCount] = useState(0)
  const [reviewsCount, setReviewsCount] = useState(0)
  const [ratingsCount, setRatingsCount] = useState(0)
  const [averageRating, setAverageRating] = useState('0.0')
  const [triviaUnlocked, setTriviaUnlocked] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // UI States
  const [toast, setToast] = useState(null)

  // Auth Redirect check
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/')
    } else {
      fetchAchievementsData()
    }
  }, [navigate])

  const fetchAchievementsData = async () => {
    try {
      setLoading(true)
      
      // 1. Fetch profile
      const profileRes = await api.get('/auth/profile')
      setUser(profileRes.data)

      // 2. Fetch watchlist length
      const watchlistRes = await api.get('/watchlist')
      const wList = watchlistRes.data || []
      setWatchlistCount(wList.length)

      // 3. Fetch reviews count
      const reviewsRes = await api.get('/reviews/user')
      const rList = reviewsRes.data || []
      setReviewsCount(rList.length)

      // 4. Fetch local ratings
      const savedRatings = localStorage.getItem('ratings')
      if (savedRatings) {
        const parsed = JSON.parse(savedRatings)
        const keys = Object.keys(parsed)
        setRatingsCount(keys.length)
        if (keys.length > 0) {
          const avg = keys.reduce((acc, curr) => acc + parsed[curr].rating, 0) / keys.length
          setAverageRating(avg.toFixed(1))
        }
      }

      // Check if trivia badge has been unlocked in localStorage
      const triviaPassed = localStorage.getItem('trivia_passed') === 'true'
      setTriviaUnlocked(triviaPassed)

    } catch (err) {
      console.error('Failed to sync achievements progress:', err)
      showToast('Error syncing cinematic badges.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (message, type) => {
    setToast({ message, type })
  }

  // XP & Levels Calculations
  const watchlistXP = watchlistCount * 15
  const reviewsXP = reviewsCount * 45
  const ratingsXP = ratingsCount * 25
  const triviaXP = triviaUnlocked ? 100 : 0
  const totalXP = watchlistXP + reviewsXP + ratingsXP + triviaXP

  // Level mapping: Level 1 (0-150 XP), Level 2 (151-350 XP), Level 3 (351-600 XP), Level 4 (601+ XP)
  let level = 1
  let levelTitle = 'Casual Popcorn Eater'
  let nextLevelXP = 150
  let prevLevelXP = 0

  if (totalXP > 600) {
    level = 4
    levelTitle = 'Master Cinephile Legend'
    nextLevelXP = 1000
    prevLevelXP = 600
  } else if (totalXP > 350) {
    level = 3
    levelTitle = 'Cinema Sage'
    nextLevelXP = 600
    prevLevelXP = 350
  } else if (totalXP > 150) {
    level = 2
    levelTitle = 'Film Critique Enthusiast'
    nextLevelXP = 350
    prevLevelXP = 150
  }

  const currentLevelProgressXP = totalXP - prevLevelXP
  const levelRangeXP = nextLevelXP - prevLevelXP
  const levelProgressPercentage = Math.min(100, Math.max(0, (currentLevelProgressXP / levelRangeXP) * 100))

  // Estimate watch time (112 mins per movie)
  const totalMovies = watchlistCount + ratingsCount
  const estimatedHours = ((totalMovies * 112) / 60).toFixed(1)

  // BADGES DEFINITION LIST
  const BADGES = [
    {
      id: 'popcorn',
      name: 'Popcorn Devourer',
      description: 'Add at least 4 movies to your custom watchlist catalog.',
      unlocked: watchlistCount >= 4,
      icon: '🍿',
      glowClass: 'from-amber-600 to-yellow-500 shadow-amber-950/40'
    },
    {
      id: 'critic',
      name: 'Reviewer Extraordinaire',
      description: 'Write 2 or more detailed reviews for films you’ve analyzed.',
      unlocked: reviewsCount >= 2,
      icon: '✍️',
      glowClass: 'from-red-650 to-orange-500 shadow-red-950/40'
    },
    {
      id: 'connoisseur',
      name: 'Cinephile Elite',
      description: 'Complete 5 or more total movie engagements (Watchlist + Ratings).',
      unlocked: totalMovies >= 5,
      icon: '💎',
      glowClass: 'from-cyan-600 to-indigo-500 shadow-cyan-950/40'
    },
    {
      id: 'silver',
      name: 'Silver Screen Resident',
      description: 'Accumulate more than 4 hours of estimated film viewing time.',
      unlocked: parseFloat(estimatedHours) >= 4.0,
      icon: '🎬',
      glowClass: 'from-purple-650 to-pink-500 shadow-purple-950/40'
    },
    {
      id: 'explorer',
      name: 'Vanguard Explorer',
      description: 'Rate films to set an average critic score of 7.5 or above.',
      unlocked: ratingsCount > 0 && parseFloat(averageRating) >= 7.5,
      icon: '🌀',
      glowClass: 'from-emerald-600 to-teal-500 shadow-emerald-950/40'
    },
    {
      id: 'trivia',
      name: 'Trivia Champion',
      description: 'Successfully pass the Cinephile Trivia Challenge with a score of 80% or higher.',
      unlocked: triviaUnlocked,
      icon: '👑',
      glowClass: 'from-yellow-600 to-amber-400 shadow-yellow-950/40'
    }
  ]

  const unlockedCount = BADGES.filter(b => b.unlocked).length

  // SVG Gauge variables
  const radius = 60
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (levelProgressPercentage / 100) * circumference

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center gap-4 animate-fade-in">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-zinc-900" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-600 animate-spin" />
        </div>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest animate-pulse">Syncing Achievements System</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24 animate-fade-in">
      <Navbar />

      {/* Header section */}
      <div className="pt-28 pb-10 max-w-5xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-3 text-red-500 font-extrabold text-xs tracking-widest uppercase">
          <span>🏆 MEMBER RANK SYSTEM</span>
          <span className="text-zinc-700">•</span>
          <span>SYNCED STATUS</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
          Achievements <span className="text-red-500 glow-red">Vault</span>
        </h1>
        <p className="text-zinc-400 text-sm max-w-2xl font-medium leading-relaxed">
          Unlock badges, levels, and prestigious awards as you curate your watchlists, write detailed movie critiques, rate cinematic releases, and pass trivia cards.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Level Progress and Level Gauge (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="glass-panel p-6 rounded-3xl flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden group">
            
            {/* Background glowing circle */}
            <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />

            <div className="space-y-1">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Current Standing</h3>
              <p className="text-lg font-black text-red-500 glow-red mt-0.5">{levelTitle}</p>
            </div>

            {/* Circular Gauge */}
            <div className="relative flex items-center justify-center mt-2">
              <svg className="w-40 h-40 transform -rotate-90 overflow-visible">
                {/* Background circle track */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  className="stroke-zinc-900"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Progress track */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  className="stroke-red-600 transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              {/* Inner core displaying Level text */}
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Level</span>
                <span className="text-3xl font-black text-white leading-none mt-1">{level}</span>
              </div>
            </div>

            {/* XP progress bars detail */}
            <div className="w-full space-y-2">
              <div className="flex justify-between text-[10px] font-black text-zinc-400 px-1">
                <span>{totalXP} TOTAL XP</span>
                <span className="text-zinc-500">{levelRangeXP - currentLevelProgressXP} XP to Level {level + 1}</span>
              </div>
              <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/40 p-[2px]">
                <div
                  className="h-full bg-gradient-to-r from-red-650 to-orange-500 rounded-full transition-all duration-1000"
                  style={{ width: `${levelProgressPercentage}%` }}
                />
              </div>
            </div>

            {/* Tier Milestone list info */}
            <div className="w-full border-t border-zinc-900/80 pt-4 space-y-2.5 text-left text-xs font-semibold text-zinc-400">
              <div className="flex justify-between">
                <span>Watchlist XP</span>
                <span className="text-zinc-300 font-mono">+{watchlistXP} XP</span>
              </div>
              <div className="flex justify-between">
                <span>Review Submissions XP</span>
                <span className="text-zinc-300 font-mono">+{reviewsXP} XP</span>
              </div>
              <div className="flex justify-between">
                <span>Movie Ratings XP</span>
                <span className="text-zinc-300 font-mono">+{ratingsXP} XP</span>
              </div>
              <div className="flex justify-between">
                <span>Trivia Unlock XP</span>
                <span className="text-zinc-300 font-mono">+{triviaXP} XP</span>
              </div>
            </div>

          </div>

          {/* Quick tips display */}
          <div className="glass-panel p-6 rounded-3xl space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-300">Level Up Advice</h4>
            <ul className="text-[10px] text-zinc-500 space-y-2 font-semibold">
              <li className="flex items-start gap-1.5 leading-normal">
                <span className="text-red-500 shrink-0">•</span>
                Rate a movie on details pages to instantly unlock 25 XP.
              </li>
              <li className="flex items-start gap-1.5 leading-normal">
                <span className="text-red-500 shrink-0">•</span>
                Submit detailed reviews to add 45 XP per submission.
              </li>
              <li className="flex items-start gap-1.5 leading-normal">
                <span className="text-red-500 shrink-0">•</span>
                Play the Trivia deck and pass to snap up 100 XP instantly!
              </li>
            </ul>
          </div>

        </div>

        {/* Right Side: Achievements Badges grid (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">
              CINEPHILE BADGES VAULT ({unlockedCount}/{BADGES.length} UNLOCKED)
            </h3>
            <span className="text-[10px] font-black text-red-500 bg-red-950/20 border border-red-900/30 px-2 py-0.5 rounded uppercase">
              {Math.round((unlockedCount / BADGES.length) * 100)}% Vault Complete
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BADGES.map((badge) => (
              <div
                key={badge.id}
                className={`glass-panel p-5 rounded-3xl border flex gap-4 transition-all duration-300 relative overflow-hidden group ${
                  badge.unlocked
                    ? 'border-zinc-800 bg-zinc-900/10'
                    : 'border-zinc-950/80 bg-zinc-950/40 opacity-55'
                }`}
              >
                
                {/* Visual glow backdrop for unlocked badges */}
                {badge.unlocked && (
                  <div className={`absolute -top-12 -right-12 w-24 h-24 rounded-full bg-gradient-to-br ${badge.glowClass} opacity-5 blur-2xl group-hover:opacity-10 transition`} />
                )}

                {/* Badge Icon bubble */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 border transition-all duration-300 ${
                  badge.unlocked
                    ? 'bg-zinc-900/80 border-zinc-800 shadow-md group-hover:scale-105'
                    : 'bg-zinc-950 border-zinc-900 text-zinc-600'
                }`}>
                  {badge.icon}
                </div>

                {/* Badge Content */}
                <div className="space-y-1 min-w-0 flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-1.5">
                    <h4 className={`font-extrabold text-sm truncate ${
                      badge.unlocked ? 'text-zinc-100 group-hover:text-white' : 'text-zinc-500'
                    }`}>
                      {badge.name}
                    </h4>
                    {badge.unlocked && (
                      <span className="text-[9px] font-black text-emerald-400 bg-emerald-950/20 px-1.5 py-0.2 rounded border border-emerald-900/30 uppercase shrink-0">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-500 font-semibold leading-relaxed">
                    {badge.description}
                  </p>
                </div>

              </div>
            ))}
          </div>

          {/* Personal Cinema Stats block card */}
          <div className="glass-panel p-6 rounded-3xl space-y-6">
            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <span>📊</span> Personal Cinema Stats
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              <div className="bg-zinc-900/30 border border-zinc-900 p-4 rounded-2xl text-center space-y-1">
                <p className="text-zinc-500 text-[9px] font-black uppercase">Watchlist Size</p>
                <p className="text-xl md:text-2xl font-black text-white">{watchlistCount}</p>
                <p className="text-[9px] text-zinc-600 font-semibold">Movies Curated</p>
              </div>

              <div className="bg-zinc-900/30 border border-zinc-900 p-4 rounded-2xl text-center space-y-1">
                <p className="text-zinc-500 text-[9px] font-black uppercase">Critiques Left</p>
                <p className="text-xl md:text-2xl font-black text-white">{reviewsCount}</p>
                <p className="text-[9px] text-zinc-600 font-semibold">Reviews Published</p>
              </div>

              <div className="bg-zinc-900/30 border border-zinc-900 p-4 rounded-2xl text-center space-y-1">
                <p className="text-zinc-500 text-[9px] font-black uppercase">Hours Logged</p>
                <p className="text-xl md:text-2xl font-black text-white">{estimatedHours}h</p>
                <p className="text-[9px] text-zinc-600 font-semibold">Estimated Watch</p>
              </div>

              <div className="bg-zinc-900/30 border border-zinc-900 p-4 rounded-2xl text-center space-y-1">
                <p className="text-zinc-500 text-[9px] font-black uppercase">Average Score</p>
                <p className="text-xl md:text-2xl font-black text-amber-500">★ {averageRating}</p>
                <p className="text-[9px] text-zinc-600 font-semibold">Ratings Synced</p>
              </div>

            </div>
          </div>

        </div>

      </div>

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

export default Achievements
