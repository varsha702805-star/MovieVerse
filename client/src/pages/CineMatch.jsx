import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import Navbar from '../components/Navbar'
import Toast from '../components/Toast'

const MOODS = [
  { id: 'mind_bent', label: 'Mind Bent 🧠', genreIds: [878, 9648, 53], tagline: 'Mind-twisting mysteries and cerebral science fiction.' },
  { id: 'thrill', label: 'Thrill Seeker ⚡', genreIds: [28, 53, 12], tagline: 'Adrenaline-pumping action and high-stakes suspense.' },
  { id: 'romantic', label: 'Hopeless Romantic 💖', genreIds: [10749, 18], tagline: 'Sweeping love stories and heartfelt human connections.' },
  { id: 'laughter', label: 'Laughter Therapy 😂', genreIds: [35, 16], tagline: 'Hilarious comedies and lighthearted animated fun.' },
  { id: 'explore', label: 'Epic Explorer 🗺️', genreIds: [12, 14, 28], tagline: 'Grand fantasy worlds, historical quests, and discoveries.' },
  { id: 'tear', label: 'Tear Jerker 😢', genreIds: [18], tagline: 'Deeply moving emotional dramas and powerful narratives.' },
  { id: 'spooky', label: 'Spooky & Chill 👻', genreIds: [27, 9648], tagline: 'Eerie hauntings, psychological horror, and dark mystery.' }
]

const ERAS = [
  { id: 'modern', label: 'Modern Blockbusters (2010s-Present)', minYear: 2010, maxYear: 2026 },
  { id: 'nostalgic', label: 'Nostalgic Classics (90s-2000s)', minYear: 1990, maxYear: 2009 },
  { id: 'golden', label: 'Golden Era (70s-80s)', minYear: 1970, maxYear: 1989 },
  { id: 'retro', label: 'Retro Cinema (Before 1970)', minYear: 1940, maxYear: 1969 }
]

const LOADING_STEPS = [
  'Decrypting your cinematic persona...',
  'Analyzing MovieVerse database catalog...',
  'Filtering out the filler films...',
  'Synthesizing artistic vs popcorn weight...',
  'Consulting the CineMatch Oracle...',
  'Polishing recommended matches...'
]

function CineMatch() {
  const navigate = useNavigate()
  
  // Selection States
  const [selectedMood, setSelectedMood] = useState(MOODS[0])
  const [selectedEra, setSelectedEra] = useState(ERAS[0])
  const [depthWeight, setDepthWeight] = useState(50) // 0: Pure Fun, 100: Heavy Artistic Depth
  
  // Process States
  const [matching, setMatching] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [recommendations, setRecommendations] = useState([])
  const [searched, setSearched] = useState(false)
  
  // UI States
  const [toast, setToast] = useState(null)

  // Session verification
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/')
    }
  }, [navigate])

  // Dynamic loading phase animation
  useEffect(() => {
    let interval
    if (matching) {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= LOADING_STEPS.length - 1) {
            return prev
          }
          return prev + 1
        })
      }, 1000)
    } else {
      setCurrentStep(0)
    }
    return () => clearInterval(interval)
  }, [matching])

  const triggerCineMatch = async () => {
    setMatching(true)
    setSearched(false)
    setRecommendations([])
    
    // Choose genre ID from the mood list
    const genres = selectedMood.genreIds
    const chosenGenreId = genres[Math.floor(Math.random() * genres.length)]
    
    // Choose random year within selected era
    const randomYear = Math.floor(
      Math.random() * (selectedEra.maxYear - selectedEra.minYear + 1)
    ) + selectedEra.minYear
    
    // Map depthWeight to TMDB rating
    // Pure Fun (0) -> rating >= 0
    // Artistic Depth (100) -> rating >= 7.8
    const minRatingValue = (depthWeight / 100 * 7.8).toFixed(1)

    try {
      // Artificially delay for matching experience (3 seconds total)
      await new Promise((resolve) => setTimeout(resolve, 3000))
      
      const res = await api.get('/movies/discover', {
        params: {
          genre: chosenGenreId,
          year: randomYear,
          rating: minRatingValue,
          page: 1,
          sort_by: depthWeight > 60 ? 'vote_average.desc' : 'popularity.desc'
        }
      })
      
      const list = res.data.Search || []
      
      // Inject dynamic matching percentage in client-side
      const mappedResults = list.slice(0, 6).map((movie, idx) => {
        // Base match score: starts at 98% and scales down slightly
        // Add random variance based on the depth weight similarity
        const basePercent = 98 - idx * 3.5
        const variance = Math.floor(Math.random() * 3)
        const matchPercent = Math.max(78, Math.min(99, basePercent - variance))
        
        return {
          ...movie,
          matchPercent,
          compatibilityLabel: depthWeight > 75 
            ? 'Cinephile Elite Choice' 
            : depthWeight < 25 
              ? 'Popcorn Blockbuster' 
              : 'Perfect Balance'
        }
      })
      
      setRecommendations(mappedResults)
      setSearched(true)
      showToast(`Oracle found ${mappedResults.length} matches!`, 'success')
    } catch (err) {
      console.error('CineMatch search error:', err)
      showToast('The CineMatch Oracle is temporarily sleeping. Please try again.', 'error')
    } finally {
      setMatching(false)
    }
  }

  const showToast = (message, type) => {
    setToast({ message, type })
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24 animate-fade-in">
      <Navbar />

      {/* Hero Banner Header */}
      <div className="pt-28 pb-10 max-w-5xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-3 text-red-500 font-extrabold text-xs tracking-widest uppercase">
          <span>🧠 AI PREDICTOR ENGINE</span>
          <span className="text-zinc-700">•</span>
          <span>BETA v2.4</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
          CineMatch <span className="text-red-500 glow-red">Predictor</span>
        </h1>
        <p className="text-zinc-400 text-sm max-w-2xl font-medium leading-relaxed">
          Decipher your subconscious viewing cravings. Combine your active mood, preferred cinematic timeline, and specific weight preference to let the MovieVerse engine summon perfect recommendations.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Match Control Form */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-3xl space-y-8">
          
          {/* Mood Selector Segment */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <span>🎭</span> 1. Select Current Mood
            </label>
            <div className="grid grid-cols-1 gap-2">
              {MOODS.map((m) => {
                const isSelected = selectedMood.id === m.id
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMood(m)}
                    className={`w-full text-left p-3.5 rounded-2xl border text-sm font-semibold transition-all relative overflow-hidden group ${
                      isSelected
                        ? 'bg-red-950/20 border-red-500/50 text-red-400 shadow-lg shadow-red-950/20'
                        : 'bg-zinc-900/40 border-zinc-800/80 text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex justify-between items-center relative z-10">
                      <div>
                        <p className="font-bold text-sm text-zinc-200 group-hover:text-white transition">{m.label}</p>
                        <p className="text-[10px] text-zinc-500 font-medium mt-0.5">{m.tagline}</p>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Era Selector Segment */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <span>📅</span> 2. Choose Timeline Era
            </label>
            <div className="grid grid-cols-1 gap-2">
              {ERAS.map((e) => {
                const isSelected = selectedEra.id === e.id
                return (
                  <button
                    key={e.id}
                    onClick={() => setSelectedEra(e)}
                    className={`w-full text-left px-4 py-3 rounded-2xl border text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-red-950/20 border-red-500/50 text-red-400'
                        : 'bg-zinc-900/40 border-zinc-800/80 text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{e.label}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">{e.minYear}-{e.maxYear}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Weighting Slider Segment */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <span>⚖️</span> 3. Artistic vs Popcorn Fun
              </label>
              <span className="text-[10px] font-black font-mono text-red-500 bg-red-950/20 px-2 py-0.5 rounded border border-red-900/30">
                {depthWeight}% Depth
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={depthWeight}
              onChange={(e) => setDepthWeight(parseInt(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-650"
            />
            <div className="flex justify-between text-[10px] font-bold text-zinc-500">
              <span>Mindless Popcorn Fun 🍿</span>
              <span>Heavy Artistic Depth 🎭</span>
            </div>
          </div>

          {/* Summon Button */}
          <button
            onClick={triggerCineMatch}
            disabled={matching}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-extrabold text-sm py-4 rounded-2xl transition duration-300 glow-btn-red flex items-center justify-center gap-2 active:scale-98 cursor-pointer disabled:cursor-not-allowed"
          >
            {matching ? (
              <>
                <svg className="animate-spin w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Summoning Matches...
              </>
            ) : (
              <>
                <span>🔮</span> Summon Recommendations
              </>
            )}
          </button>

        </div>

        {/* Right Side: Recommendations Results */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Default / Loading / Search Results State Switcher */}
          {!matching && !searched && (
            <div className="glass-panel rounded-3xl p-12 text-center space-y-4 flex flex-col items-center justify-center min-h-[480px]">
              <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 text-3xl shadow-inner mb-2 animate-bounce">
                🔮
              </div>
              <h3 className="text-xl font-bold tracking-tight">Oracle Awaiting Input</h3>
              <p className="text-zinc-500 text-xs font-semibold max-w-sm mx-auto leading-relaxed">
                Configure your mood and weights on the left side, then hit "Summon Recommendations" to prompt the MovieVerse backend TMDB engine.
              </p>
            </div>
          )}

          {matching && (
            <div className="glass-panel rounded-3xl p-12 text-center space-y-6 flex flex-col items-center justify-center min-h-[480px]">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-zinc-900" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-600 animate-spin" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black uppercase tracking-widest text-red-500 animate-pulse">Running CineMatch Algorithm</h4>
                <p className="text-sm font-bold text-zinc-200 mt-1 transition-all duration-300">{LOADING_STEPS[currentStep]}</p>
              </div>
            </div>
          )}

          {searched && !matching && recommendations.length === 0 && (
            <div className="glass-panel rounded-3xl p-12 text-center space-y-4 flex flex-col items-center justify-center min-h-[480px]">
              <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 text-3xl shadow-inner mb-2">
                💔
              </div>
              <h3 className="text-xl font-bold tracking-tight">No Cinematic Matches Found</h3>
              <p className="text-zinc-500 text-xs font-semibold max-w-sm mx-auto leading-relaxed">
                The oracle discovered no matches for this specific combination in the database. Try lowering your Artistic Depth slider or changing your Era!
              </p>
            </div>
          )}

          {searched && !matching && recommendations.length > 0 && (
            <div className="space-y-6">
              
              {/* Header result stats */}
              <div className="flex justify-between items-center px-2">
                <p className="text-xs font-bold text-zinc-400">
                  SUMMONED RECOMMENDATIONS ({recommendations.length})
                </p>
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 px-2 py-0.5 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Calculations Synced
                </div>
              </div>

              {/* Movie suggestion Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((movie) => (
                  <div
                    key={movie.imdbID}
                    className="glass-card hover:bg-zinc-900/30 rounded-2xl overflow-hidden border border-zinc-900 hover:border-zinc-800 transition-all duration-300 flex flex-col group"
                  >
                    
                    {/* Poster Canvas */}
                    <div className="relative aspect-[16/10] bg-zinc-900 overflow-hidden">
                      {movie.Poster && movie.Poster !== 'N/A' ? (
                        <img
                          src={movie.Poster}
                          alt={movie.Title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col justify-center items-center text-zinc-700 bg-zinc-950">
                          <span className="text-3xl">🎬</span>
                          <span className="text-[10px] font-black uppercase tracking-wider mt-2">No Poster</span>
                        </div>
                      )}

                      {/* Overlays */}
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />
                      
                      {/* Match percentage pill tag */}
                      <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-xl shadow-lg glow-red flex items-center gap-1">
                        <span>🔮</span> {movie.matchPercent}% Match
                      </div>

                      {/* Compatibility pill tag */}
                      <div className="absolute bottom-3 left-3 bg-black/60 border border-zinc-800 text-zinc-300 text-[9px] font-black px-2 py-0.5 rounded-lg backdrop-blur-sm">
                        {movie.compatibilityLabel}
                      </div>
                    </div>

                    {/* Movie Info */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-sm text-zinc-100 group-hover:text-white line-clamp-1 transition">
                          {movie.Title}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold">
                          <span>{movie.Year}</span>
                          <span>•</span>
                          <span className="text-amber-500">★ {movie.Rating}/10</span>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(`/movie/${movie.imdbID}`)}
                        className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white font-bold text-xs py-2 rounded-xl transition duration-200 flex items-center justify-center gap-1.5"
                      >
                        Inspect Details
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          )}

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

export default CineMatch
