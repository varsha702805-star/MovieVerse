import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Toast from '../components/Toast'

const NEWS_CATEGORIES = [
  { id: 'all', label: 'All Stories' },
  { id: 'awards', label: 'Awards & Oscars 🏆' },
  { id: 'boxoffice', label: 'Box Office Hits 📈' },
  { id: 'behind', label: 'Behind the Scenes 🎬' },
  { id: 'tech', label: 'Cinema Tech 🍿' }
]

const BOX_OFFICE_DATA = [
  { title: 'Avatar: Way of Water', gross: 2320, color: '#dc2626' },
  { title: 'Avengers: Endgame', gross: 2798, color: '#b91c1c' },
  { title: 'Barbie (2023)', gross: 1445, color: '#ec4899' },
  { title: 'Oppenheimer', gross: 957, color: '#f59e0b' },
  { title: 'Inside Out 2', gross: 1680, color: '#3b82f6' }
]

const NEWS_ARTICLES = [
  {
    id: 1,
    category: 'awards',
    title: 'Oscars 2027: Predictive Shortlists Reveal Surprising Dark Horse Contenders',
    summary: 'From indie horror breakouts to sci-fi epics, this year’s preliminary shortlists are throwing Academy voters into unprecedented debates.',
    content: 'The Academy of Motion Picture Arts and Sciences has dropped its preliminary shortlist selections for the upcoming 99th Oscars. While major tentpole pictures hold their expected dominance in technical visual effects categories, indie distribution houses are capturing historic double-nominations in original screenplay and sound design categories. A striking psychological thriller has emerged as a front-runner for Best Picture, hinting at a progressive shift in historical voting patterns.',
    author: 'Elena Rostova',
    date: 'May 20, 2026',
    readTime: '4 min read',
    likes: 142,
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 2,
    category: 'boxoffice',
    title: 'Global Box Office Surge: Post-Summer Blockbusters Outperform Pre-Pandemic Baselines',
    summary: 'Cinematic attendance reaches a 10-year high point as premium theater integrations and immersive spatial audio draw audiences back.',
    content: 'Theater owners worldwide are celebrating a monumental surge in high-capacity cinematic attendance. Driven heavily by the expansion of premium screen formats like IMAX and Dolby Cinema, tickets sold have crossed key baseline metrics not witnessed since 2019. High-tier spatial sound structures and comfortable dine-in concepts are cited as primary catalysts driving this theatrical renaissance, cementing the traditional theater experience as irreplaceable.',
    author: 'Julian Mercer',
    date: 'May 18, 2026',
    readTime: '5 min read',
    likes: 98,
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 3,
    category: 'behind',
    title: 'An Inside Look: The Mechanical Magic Behind Dune’s Epic Practical Effects',
    summary: 'Visual directors break down how mechanical engineering, massive fans, and real desert locations minimized dependency on green screen.',
    content: 'In an exclusive interview, visual effects supervisor Marcus Vance details the grueling production requirements of building massive sand-shaker mechanical platforms in the Jordan desert. Rather than rendering landscapes inside virtual sets, engineers crafted physical hydraulics capable of shifting thousands of pounds of sand in real-time, providing actors with actual kinetic feedback and producing unparalleled visual authenticity.',
    author: 'Sarah Jenkins',
    date: 'May 15, 2026',
    readTime: '7 min read',
    likes: 215,
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 4,
    category: 'tech',
    title: 'Laser Projection & HDR: The New Tech Driving High-Fidelity Theatrical Formats',
    summary: 'Laser-illuminated projection systems are replacing traditional digital xenon bulbs, bringing true blacks and blinding HDR to local theaters.',
    content: 'A massive wave of theater retrofitting is introducing high-efficiency laser projectors to local neighborhood cinemas. By replacing standard mercury bulbs, these new laser arrays supply incredible high-dynamic-range (HDR) contrasts, yielding 10x deep blacks and incredible light output. Cinephiles can now witness movies exactly as cinematographers graded them in mastering suites, bridging the fidelity gap.',
    author: 'Dr. Aaron Kim',
    date: 'May 12, 2026',
    readTime: '3 min read',
    likes: 76,
    image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 5,
    category: 'awards',
    title: 'Cannes Film Festival 2026: Independent Directors Sweep Major Juried Awards',
    summary: 'The Golden Palm was awarded to a low-budget black-and-white family drama, marking a triumphant year for minimalist storytelling.',
    content: 'Cannes ended in standard dramatic fashion with jury president Claire Denis presenting the Palme d’Or to a minimal domestic drama shot entirely in monochrome. Running against high-budget productions backed by streaming giants, the winning film took audiences by storm through its quiet screenplay, hyper-realistic long takes, and outstanding non-professional cast performances.',
    author: 'Elena Rostova',
    date: 'May 10, 2026',
    readTime: '6 min read',
    likes: 189,
    image: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&q=80&w=600'
  }
]

function MovieNews() {
  const navigate = useNavigate()
  
  // Selection states
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedArticleId, setExpandedArticleId] = useState(null)
  
  // Interactive like / bookmark states
  const [likesState, setLikesState] = useState(() => {
    const initial = {}
    NEWS_ARTICLES.forEach(a => { initial[a.id] = a.likes })
    return initial
  })
  const [likedArticles, setLikedArticles] = useState([])
  const [bookmarkedArticles, setBookmarkedArticles] = useState([])
  
  // Stats graph selection highlight
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null)

  // UI States
  const [toast, setToast] = useState(null)

  // Session check
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/')
    }
  }, [navigate])

  const handleLike = (articleId, e) => {
    e.stopPropagation()
    const isLiked = likedArticles.includes(articleId)
    
    if (isLiked) {
      setLikedArticles(prev => prev.filter(id => id !== articleId))
      setLikesState(prev => ({ ...prev, [articleId]: prev[articleId] - 1 }))
      showToast('Article unliked.', 'info')
    } else {
      setLikedArticles(prev => [...prev, articleId])
      setLikesState(prev => ({ ...prev, [articleId]: prev[articleId] + 1 }))
      showToast('Added to your liked stories!', 'success')
    }
  }

  const handleBookmark = (articleId, e) => {
    e.stopPropagation()
    const isBookmarked = bookmarkedArticles.includes(articleId)
    
    if (isBookmarked) {
      setBookmarkedArticles(prev => prev.filter(id => id !== articleId))
      showToast('Removed bookmark.', 'info')
    } else {
      setBookmarkedArticles(prev => [...prev, articleId])
      showToast('Saved to your reading library!', 'success')
    }
  }

  const showToast = (message, type) => {
    setToast({ message, type })
  }

  // Filters
  const filteredArticles = NEWS_ARTICLES.filter(a => {
    const matchesCategory = activeCategory === 'all' || a.category === activeCategory
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          a.summary.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // SVG Chart Dimensions
  const chartHeight = 220
  const maxGross = 3000

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24 animate-fade-in">
      <Navbar />

      {/* Header Area */}
      <div className="pt-28 pb-6 max-w-6xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-3 text-red-500 font-extrabold text-xs tracking-widest uppercase">
          <span>📰 MOVIEVERSE NEWSTAND</span>
          <span className="text-zinc-700">•</span>
          <span>LIVE REPORTING</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
          Cinematic <span className="text-red-500 glow-red">News Hub</span>
        </h1>
        <p className="text-zinc-400 text-sm max-w-3xl font-medium leading-relaxed">
          Stay informed on Box Office records, Academy Award reviews, behind-the-scenes engineering feats, and state-of-the-art theater display technologies sweeping the globe.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: News Feed (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Filters & Search Row */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-1.5 bg-zinc-900/60 p-1 rounded-2xl border border-zinc-900">
              {NEWS_CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setActiveCategory(c.id)
                    setExpandedArticleId(null)
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    activeCategory === c.id
                      ? 'bg-red-650 text-white shadow-lg shadow-red-950/20'
                      : 'text-zinc-400 hover:text-zinc-250 hover:bg-zinc-800/40'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Search Input Box */}
            <div className="relative w-full md:w-64">
              <span className="absolute inset-y-0 left-3 flex items-center text-zinc-500 pointer-events-none">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search headlines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-xl text-xs font-medium text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition"
              />
            </div>

          </div>

          {/* Articles Feed */}
          {filteredArticles.length === 0 ? (
            <div className="glass-panel p-16 rounded-3xl text-center space-y-4">
              <p className="text-3xl">📭</p>
              <h3 className="text-lg font-bold">No Stories Found</h3>
              <p className="text-zinc-500 text-xs font-semibold max-w-sm mx-auto leading-relaxed">
                We could not find any news matching "{searchQuery}" under this category. Broaden your search query!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredArticles.map((article) => {
                const isExpanded = expandedArticleId === article.id
                const isLiked = likedArticles.includes(article.id)
                const isBookmarked = bookmarkedArticles.includes(article.id)

                return (
                  <div
                    key={article.id}
                    onClick={() => setExpandedArticleId(isExpanded ? null : article.id)}
                    className="glass-panel hover:bg-zinc-900/20 rounded-3xl overflow-hidden border border-zinc-900 hover:border-zinc-800/80 transition-all duration-300 cursor-pointer group"
                  >
                    
                    <div className="flex flex-col md:flex-row">
                      
                      {/* Image Thumbnail */}
                      <div className="md:w-56 aspect-[16/10] md:aspect-auto shrink-0 bg-zinc-900 overflow-hidden relative">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-103 transition duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-zinc-950/70 via-transparent to-transparent" />
                        
                        {/* Dynamic category badge */}
                        <div className="absolute top-3 left-3 bg-black/60 border border-zinc-800 text-zinc-400 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg backdrop-blur-sm">
                          {article.category}
                        </div>
                      </div>

                      {/* Content block */}
                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start gap-4">
                            <h3 className="font-extrabold text-base md:text-lg text-zinc-100 group-hover:text-white transition line-clamp-2">
                              {article.title}
                            </h3>
                          </div>
                          
                          <p className="text-xs text-zinc-400 font-medium leading-relaxed line-clamp-3">
                            {article.summary}
                          </p>
                        </div>

                        {/* Author info and actions footer */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-zinc-900/60">
                          <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-semibold">
                            <span>By {article.author}</span>
                            <span>•</span>
                            <span>{article.date}</span>
                            <span>•</span>
                            <span className="text-red-400">{article.readTime}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Like Action */}
                            <button
                              onClick={(e) => handleLike(article.id, e)}
                              className={`p-2 rounded-xl border transition flex items-center gap-1.5 text-[10px] font-black ${
                                isLiked
                                  ? 'bg-rose-950/20 border-rose-500/30 text-rose-400'
                                  : 'bg-zinc-900/40 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                              }`}
                              title={isLiked ? 'Unlike Article' : 'Like Article'}
                            >
                              <span>{isLiked ? '❤️' : '🤍'}</span>
                              <span>{likesState[article.id]}</span>
                            </button>

                            {/* Bookmark Action */}
                            <button
                              onClick={(e) => handleBookmark(article.id, e)}
                              className={`p-2 rounded-xl border transition flex items-center justify-center ${
                                isBookmarked
                                  ? 'bg-amber-950/20 border-amber-500/30 text-amber-400'
                                  : 'bg-zinc-900/40 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                              }`}
                              title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Article'}
                            >
                              <span>{isBookmarked ? '🔖' : '📁'}</span>
                            </button>
                          </div>
                        </div>

                      </div>

                    </div>

                    {/* Expandable detailed content section */}
                    {isExpanded && (
                      <div className="p-6 bg-zinc-950/50 border-t border-zinc-900/80 text-zinc-300 font-medium text-xs leading-relaxed space-y-4 animate-fade-in">
                        <p>{article.content}</p>
                        <div className="p-4 bg-zinc-900/30 border border-zinc-900 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-3">
                          <span className="text-[10px] font-black text-zinc-500 uppercase">
                            DO YOU SUPPORT THIS STORY REPORT?
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => handleLike(article.id, e)}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-[10px] rounded-xl transition"
                            >
                              {isLiked ? '★ Rated Story' : '👍 Recommend Article'}
                            </button>
                            <button
                              onClick={(e) => handleBookmark(article.id, e)}
                              className="px-4 py-2 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 font-bold text-[10px] rounded-xl transition border border-zinc-800"
                            >
                              {isBookmarked ? 'Saved to Shelf' : '📁 Add to Reading List'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                )
              })}
            </div>
          )}

        </div>

        {/* Right Side: Global Box Office Stats Graph (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="glass-panel p-6 rounded-3xl space-y-6">
            
            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase tracking-wider text-zinc-200 flex items-center gap-1.5">
                <span>📈</span> Box Office Legends
              </h3>
              <p className="text-[10px] text-zinc-500 font-semibold">
                Highest Grossing Cinematic Records (in Millions USD)
              </p>
            </div>

            {/* Glowing SVG Bar Chart */}
            <div className="relative pt-4">
              <svg width="100%" height={chartHeight} className="overflow-visible">
                {BOX_OFFICE_DATA.map((movie, idx) => {
                  const barWidth = 32
                  const spacing = 45
                  const xPos = idx * spacing + 15
                  // Calculate height scale
                  const barHeight = (movie.gross / maxGross) * (chartHeight - 40)
                  const yPos = chartHeight - barHeight - 20
                  const isHovered = hoveredBarIndex === idx

                  return (
                    <g
                      key={movie.title}
                      onMouseEnter={() => setHoveredBarIndex(idx)}
                      onMouseLeave={() => setHoveredBarIndex(null)}
                      className="cursor-pointer"
                    >
                      {/* Drop Glow Def */}
                      <filter id={`glow-${idx}`}>
                        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>

                      {/* Hover Highlight background column */}
                      <rect
                        x={xPos - 5}
                        y={10}
                        width={barWidth + 10}
                        height={chartHeight - 30}
                        fill={isHovered ? 'rgba(255, 255, 255, 0.02)' : 'transparent'}
                        rx={8}
                        className="transition-colors duration-200"
                      />

                      {/* The Bar */}
                      <rect
                        x={xPos}
                        y={yPos}
                        width={barWidth}
                        height={barHeight}
                        fill={movie.color}
                        opacity={isHovered ? 1 : 0.85}
                        filter={isHovered ? `url(#glow-${idx})` : undefined}
                        rx={6}
                        className="transition-all duration-300"
                      />

                      {/* Small floating amount tag */}
                      {isHovered && (
                        <text
                          x={xPos + barWidth / 2}
                          y={yPos - 8}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="9"
                          fontWeight="900"
                          className="animate-fade-in font-mono"
                        >
                          ${movie.gross}M
                        </text>
                      )}
                    </g>
                  )
                })}
                
                {/* Baseline Axis */}
                <line
                  x1="0"
                  y1={chartHeight - 20}
                  x2="100%"
                  y2={chartHeight - 20}
                  stroke="#27272a"
                  strokeWidth="2"
                />
              </svg>

              {/* Chart Legend info details */}
              <div className="mt-4 space-y-2 border-t border-zinc-900/60 pt-4">
                {BOX_OFFICE_DATA.map((movie, idx) => {
                  const isHovered = hoveredBarIndex === idx
                  return (
                    <div
                      key={movie.title}
                      onMouseEnter={() => setHoveredBarIndex(idx)}
                      onMouseLeave={() => setHoveredBarIndex(null)}
                      className={`flex justify-between items-center px-2.5 py-1.5 rounded-xl transition ${
                        isHovered ? 'bg-zinc-900/50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: movie.color }}
                        />
                        <span className="text-[10px] font-bold text-zinc-300 truncate">{movie.title}</span>
                      </div>
                      <span className="text-[10px] font-black font-mono text-zinc-500">${movie.gross} Million</span>
                    </div>
                  )
                })}
              </div>

            </div>

          </div>

          {/* Quick Newsletter Module */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-300">
              📬 CineBrief Weekly
            </h4>
            <p className="text-[10px] text-zinc-500 font-semibold leading-relaxed">
              Get raw director summaries, screenplay breakdowns, and festival alerts delivered straight to your email.
            </p>
            <div className="space-y-2">
              <input
                type="email"
                placeholder="cinematic@address.com"
                className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-xs font-medium focus:outline-none focus:border-red-500 transition"
              />
              <button
                onClick={() => showToast('Subscribed to CineBrief updates!', 'success')}
                className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white font-bold text-xs py-2 rounded-xl transition duration-200"
              >
                Join Newsletter
              </button>
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

export default MovieNews
