import { useState, useEffect } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import api from '../utils/api'

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

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('search') || ''
  const [navSearch, setNavSearch] = useState(searchQuery)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Sync local search input with URL search query
  useEffect(() => {
    setNavSearch(searchQuery)
  }, [searchQuery])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (navSearch.trim()) {
      navigate(`/dashboard?search=${encodeURIComponent(navSearch.trim())}`)
    } else {
      navigate('/dashboard')
    }
    setIsDrawerOpen(false)
  }
  const [isGenresCollapsed, setIsGenresCollapsed] = useState(true)
  const [isLoungeCollapsed, setIsLoungeCollapsed] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userInitial, setUserInitial] = useState('')
  const [userAvatar, setUserAvatar] = useState('')
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
    if (token) {
      fetchNavbarProfile()
    }
  }, [location.pathname])

  const fetchNavbarProfile = async () => {
    try {
      const res = await api.get('/auth/profile')
      if (res.data) {
        setUserName(res.data.name)
        setUserAvatar(res.data.avatar || '')
        setUserInitial(res.data.name.charAt(0).toUpperCase())
      }
    } catch (err) {
      console.error('Navbar profile fetch error:', err)
    }
  }

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
    setIsDrawerOpen(false)
    navigate('/')
  }

  const handleHomeClick = () => {
    sessionStorage.removeItem('dashboard_movies')
    sessionStorage.removeItem('dashboard_trending')
    sessionStorage.removeItem('dashboard_featured')
    sessionStorage.removeItem('dashboard_page')
    sessionStorage.removeItem('dashboard_total_pages')
    setIsDrawerOpen(false)
    navigate(isLoggedIn ? '/dashboard' : '/')
  }

  const navigateToGenre = (genre) => {
    setIsDrawerOpen(false)
    navigate(`/dashboard?genre=${encodeURIComponent(genre.label)}&genreId=${genre.id}`)
  }

  const handleNavClick = (path) => {
    setIsDrawerOpen(false)
    navigate(path)
  }

  return (
    <>
      <nav className="fixed top-0 w-full glass-nav z-40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* Hamburger Button (3-Line Icon) */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="text-zinc-400 hover:text-white transition duration-200 focus:outline-none p-1.5 rounded-lg hover:bg-zinc-900"
              aria-label="Toggle navigation menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Brand Logo */}
            <h1
              onClick={handleHomeClick}
              className="text-white text-2xl font-black cursor-pointer tracking-tight transition-all duration-300 hover:scale-102 flex items-center gap-1.5"
            >
              <span>🎬</span><span><span className="text-red-500 glow-red">M</span>OVIE <span className="text-red-500 glow-red">V</span>ERSE</span>
            </h1>
          </div>

          {/* Centered Desktop Global Search (Only when logged in) */}
          {isLoggedIn && (
            <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative max-w-md w-full mx-8">
              <input
                type="text"
                placeholder="Search movies, TV shows..."
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                className="w-full bg-zinc-900/60 hover:bg-zinc-900 focus:bg-zinc-950 text-white placeholder-zinc-500 pl-10 pr-4 py-2 rounded-xl text-sm font-medium border border-zinc-800 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all duration-300 backdrop-blur-md"
              />
              <span className="absolute left-3.5 text-zinc-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              {navSearch && (
                <button
                  type="button"
                  onClick={() => { setNavSearch(''); navigate('/dashboard'); }}
                  className="absolute right-3 text-zinc-500 hover:text-white transition"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </form>
          )}

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={handleHomeClick}
              className={`text-sm font-semibold tracking-wide transition-colors ${
                isActive('/dashboard') ? 'text-red-500 font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Home
            </button>
            {isLoggedIn && (
              <>
                <button
                  onClick={() => navigate('/watchlist')}
                  className={`text-sm font-semibold tracking-wide transition-colors ${
                    isActive('/watchlist') ? 'text-red-500 font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Watchlist
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className={`text-sm font-semibold tracking-wide transition-colors ${
                    isActive('/profile') ? 'text-red-500 font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Profile
                </button>
              </>
            )}
            
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl text-sm font-bold tracking-wide transition-all glow-btn-red duration-200 active:scale-95"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => navigate('/')}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 px-5 py-2 rounded-xl text-sm font-bold tracking-wide transition duration-200"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Drawer Overlay (Collapsible Drawer Menu) */}
      {isDrawerOpen && (
        <div
          onClick={() => setIsDrawerOpen(false)}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 animate-fade-in"
        />
      )}

      {/* Left Navigation Side Panel Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-zinc-950 border-r border-zinc-900 z-50 flex flex-col transition-transform duration-350 ease-out transform shadow-2xl ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-zinc-900 flex justify-between items-center">
          <h2 className="text-white text-xl font-black tracking-tight flex items-center gap-1.5">
            <span>🎬</span><span><span className="text-red-500 glow-red">M</span>OVIE <span className="text-red-500 glow-red">V</span>ERSE</span>
          </h2>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-lg p-1.5 transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Drawer Scrollable Navigation Content */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {/* Mobile Drawer Search (Only when logged in) */}
          {isLoggedIn && (
            <form onSubmit={handleSearchSubmit} className="relative w-full mb-4 md:hidden">
              <input
                type="text"
                placeholder="Search movies..."
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                className="w-full bg-zinc-900/60 focus:bg-zinc-950 text-white placeholder-zinc-500 pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium border border-zinc-800 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all duration-300"
              />
              <span className="absolute left-3.5 top-3 text-zinc-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              {navSearch && (
                <button
                  type="button"
                  onClick={() => { setNavSearch(''); navigate('/dashboard'); }}
                  className="absolute right-3 top-3 text-zinc-500 hover:text-white transition"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </form>
          )}

          <div className="space-y-1">
            <button
              onClick={handleHomeClick}
              className={`w-full text-left px-4 py-3 rounded-xl font-semibold tracking-wide text-sm flex items-center gap-3.5 transition ${
                isActive('/dashboard') ? 'bg-red-950/40 text-red-400 border-l-4 border-red-500' : 'text-zinc-300 hover:bg-zinc-900/60 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home / Movies
            </button>

            {isLoggedIn && (
              <>
                <button
                  onClick={() => handleNavClick('/watchlist')}
                  className={`w-full text-left px-4 py-3 rounded-xl font-semibold tracking-wide text-sm flex items-center gap-3.5 transition ${
                    isActive('/watchlist') ? 'bg-red-950/40 text-red-400 border-l-4 border-red-500' : 'text-zinc-300 hover:bg-zinc-900/60 hover:text-white'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  My Watchlist
                </button>

                <button
                  onClick={() => handleNavClick('/profile')}
                  className={`w-full text-left px-4 py-3 rounded-xl font-semibold tracking-wide text-sm flex items-center gap-3.5 transition ${
                    isActive('/profile') ? 'bg-red-950/40 text-red-400 border-l-4 border-red-500' : 'text-zinc-300 hover:bg-zinc-900/60 hover:text-white'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Profile
                </button>
              </>
            )}
          </div>

          {/* Interactive Lounge Collapsible Section */}
          {isLoggedIn && (
            <div className="space-y-2">
              <button
                onClick={() => setIsLoungeCollapsed(!isLoungeCollapsed)}
                className="w-full px-4 py-2 flex justify-between items-center text-zinc-400 hover:text-white transition group cursor-pointer"
              >
                <span className="text-xs font-bold uppercase tracking-widest">Interactive Lounge</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${isLoungeCollapsed ? '' : 'rotate-180'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {!isLoungeCollapsed && (
                <div className="space-y-1 px-2 animate-fade-in">
                  <button
                    onClick={() => handleNavClick('/cinematch')}
                    className={`w-full text-left px-3 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-3 transition ${
                      isActive('/cinematch') ? 'bg-red-950/30 text-red-400 border-l-2 border-red-500' : 'text-zinc-300 hover:bg-zinc-900/40 hover:text-white'
                    }`}
                  >
                    <span className="text-sm shrink-0">🔮</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold truncate text-[13px]">AI CineMatch</p>
                      <p className="text-[10px] text-zinc-500 font-semibold truncate mt-0.5">Custom recommendations</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleNavClick('/news')}
                    className={`w-full text-left px-3 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-3 transition ${
                      isActive('/news') ? 'bg-red-950/30 text-red-400 border-l-2 border-red-500' : 'text-zinc-300 hover:bg-zinc-900/40 hover:text-white'
                    }`}
                  >
                    <span className="text-sm shrink-0">📰</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold truncate text-[13px]">Cinematic News</p>
                      <p className="text-[10px] text-zinc-500 font-semibold truncate mt-0.5">Box office & reviews</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleNavClick('/trivia')}
                    className={`w-full text-left px-3 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-3 transition ${
                      isActive('/trivia') ? 'bg-red-950/30 text-red-400 border-l-2 border-red-500' : 'text-zinc-300 hover:bg-zinc-900/40 hover:text-white'
                    }`}
                  >
                    <span className="text-sm shrink-0">🎮</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold truncate text-[13px]">Cinephile Trivia</p>
                      <p className="text-[10px] text-zinc-500 font-semibold truncate mt-0.5">Test film knowledge</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleNavClick('/achievements')}
                    className={`w-full text-left px-3 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-3 transition ${
                      isActive('/achievements') ? 'bg-red-950/30 text-red-400 border-l-2 border-red-500' : 'text-zinc-300 hover:bg-zinc-900/40 hover:text-white'
                    }`}
                  >
                    <span className="text-sm shrink-0">🏆</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold truncate text-[13px]">Achievements Vault</p>
                      <p className="text-[10px] text-zinc-500 font-semibold truncate mt-0.5">Unlock levels & badges</p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Genres Collapsible Group Section */}
          <div className="space-y-2">
            <button
              onClick={() => setIsGenresCollapsed(!isGenresCollapsed)}
              className="w-full px-4 py-2 flex justify-between items-center text-zinc-400 hover:text-white transition group"
            >
              <span className="text-xs font-bold uppercase tracking-widest">Browse Genres</span>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${isGenresCollapsed ? '' : 'rotate-180'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {!isGenresCollapsed && (
              <div className="grid grid-cols-2 gap-1.5 px-2 animate-fade-in">
                {GENRES.map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => navigateToGenre(genre)}
                    className="text-left px-3 py-2 text-xs font-semibold text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900/50 transition truncate flex items-center gap-1.5"
                  >
                    <span className="text-red-500/80">•</span>
                    {genre.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer Account Profile Segment */}
        {isLoggedIn && (
          <div className="p-4 border-t border-zinc-900 bg-zinc-950/50 flex flex-col gap-4">
            <div className="flex items-center gap-3 px-1">
              <div className="w-10 h-10 rounded-full bg-red-650 flex items-center justify-center text-sm font-black text-white glow-red overflow-hidden border border-zinc-800 shrink-0">
                {userAvatar ? (
                  <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  userInitial || 'U'
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black text-zinc-200 truncate leading-tight">{userName}</p>
                <p className="text-[10px] font-semibold text-zinc-500 truncate mt-0.5">Active Session</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full bg-red-950/20 text-red-500 hover:bg-red-600 hover:text-white py-3 rounded-xl font-bold text-sm transition duration-200 flex items-center justify-center gap-2 border border-red-500/10 hover:border-transparent active:scale-98 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout / Exit
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default Navbar