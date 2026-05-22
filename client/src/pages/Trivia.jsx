import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Toast from '../components/Toast'

const ALL_TRIVIA_QUESTIONS = [
  {
    id: 1,
    question: 'Which director directed the legendary Dark Knight Trilogy?',
    options: ['Martin Scorsese', 'Christopher Nolan', 'Steven Spielberg', 'David Fincher'],
    answer: 'Christopher Nolan',
    fact: 'Christopher Nolan directed Batman Begins (2005), The Dark Knight (2008), and The Dark Knight Rises (2012), grossing over $2.4 Billion globally.'
  },
  {
    id: 2,
    question: 'Which movie made history by becoming the first non-English language film to win Best Picture at the Oscars?',
    options: ['Roma', 'Crouching Tiger, Hidden Dragon', 'Parasite', 'Amélie'],
    answer: 'Parasite',
    fact: 'Directed by Bong Joon Ho, Parasite won Best Picture, Best Director, Best Original Screenplay, and Best International Feature Film at the 92nd Academy Awards.'
  },
  {
    id: 3,
    question: 'What is the highest-grossing film of all time (unadjusted for inflation)?',
    options: ['Avatar', 'Avengers: Endgame', 'Titanic', 'Star Wars: The Force Awakens'],
    answer: 'Avatar',
    fact: 'James Cameron’s Avatar (2009) remains the highest-grossing movie with over $2.9 Billion. Avengers: Endgame is second, and Titanic is third.'
  },
  {
    id: 4,
    question: 'In Quentin Tarantino’s Pulp Fiction, what is famously kept inside Marsellus Wallace’s glowing briefcase?',
    options: ['A golden trophy', 'Gold bars', 'It is never revealed', 'A diamonds pouch'],
    answer: 'It is never revealed',
    fact: 'One of the most famous MacGuffins in film history, the contents of the briefcase are never shown, leaving it forever open to debate.'
  },
  {
    id: 5,
    question: 'Which actor played the character of Neo in the sci-fi franchise The Matrix?',
    options: ['Brad Pitt', 'Johnny Depp', 'Tom Cruise', 'Keanu Reeves'],
    answer: 'Keanu Reeves',
    fact: 'Keanu Reeves has played the iconic role of Neo in all four Matrix films, starting with the genre-defining 1999 masterpiece.'
  },
  {
    id: 6,
    question: 'What was the first feature-length animated film ever released?',
    options: ['Pinocchio', 'Snow White and the Seven Dwarfs', 'Fantasia', 'Dumbo'],
    answer: 'Snow White and the Seven Dwarfs',
    fact: 'Released by Walt Disney in December 1937, Snow White was the first full-length cel-animated feature film in cinematic history.'
  },
  {
    id: 7,
    question: 'Which actor portrayed the Joker in the 2008 masterpiece The Dark Knight?',
    options: ['Jared Leto', 'Joaquin Phoenix', 'Heath Ledger', 'Jack Nicholson'],
    answer: 'Heath Ledger',
    fact: 'Heath Ledger posthumously won the Academy Award for Best Supporting Actor for his legendary, terrifying portrayal of the Joker.'
  },
  {
    id: 8,
    question: 'Which classic space opera film features the famous line: "I am your father"?',
    options: ['Star Wars: A New Hope', 'Star Wars: The Empire Strikes Back', 'Star Wars: Return of the Jedi', '2001: A Space Odyssey'],
    answer: 'Star Wars: The Empire Strikes Back',
    fact: 'Darth Vader delivers this earth-shaking revelation to Luke Skywalker in Cloud City in the legendary 1980 sequel.'
  }
]

function Trivia() {
  const navigate = useNavigate()
  
  // Game Play States
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [gameState, setGameState] = useState('welcome') // 'welcome' | 'playing' | 'ended'
  
  // UI States
  const [toast, setToast] = useState(null)

  // Session verification check
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/')
    }
  }, [navigate])

  const startChallenge = () => {
    // Select 5 random questions
    const shuffled = [...ALL_TRIVIA_QUESTIONS].sort(() => 0.5 - Math.random())
    setQuestions(shuffled.slice(0, 5))
    setCurrentIndex(0)
    setSelectedOption(null)
    setAnswered(false)
    setScore(0)
    setGameState('playing')
    showToast('Trivia Deck Loaded! Good luck!', 'info')
  }

  const handleOptionSelect = (option) => {
    if (answered) return
    
    setSelectedOption(option)
    setAnswered(true)
    
    const isCorrect = option === questions[currentIndex].answer
    if (isCorrect) {
      setScore(prev => prev + 1)
      showToast('Correct! Cinema brain unlocked.', 'success')
    } else {
      showToast('Incorrect. The oracle is disappointed!', 'error')
    }
  }

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setSelectedOption(null)
      setAnswered(false)
    } else {
      // Completed! Save state to unlock Trivia Champion badge
      const finalScore = score + (selectedOption === questions[currentIndex].answer ? 1 : 0)
      const passed = finalScore >= 4 // 80% or above is passing
      if (passed) {
        localStorage.setItem('trivia_passed', 'true')
      }
      setGameState('ended')
      showToast('Trivia Challenge Completed!', 'success')
    }
  }

  const showToast = (message, type) => {
    setToast({ message, type })
  }

  // End Score Title computations
  const getScoreSummary = () => {
    if (score === 5) return { title: 'Cinema Sage 👑', desc: 'Flawless victory! You are an oracle of absolute film culture.', style: 'text-yellow-400' }
    if (score === 4) return { title: 'Cinephile Elite 💎', desc: 'Outstanding job! Your deep movie insights are verified.', style: 'text-cyan-400' }
    if (score === 3) return { title: 'Cinema Enthusiast 🎬', desc: 'Good effort! You know your blockbusters well, but can dig deeper.', style: 'text-zinc-300' }
    return { title: 'Casual Popcorn Eater 🍿', desc: 'Keep watching! The theater is always open to expand your cinematic catalog.', style: 'text-zinc-500' }
  }

  const summary = getScoreSummary()

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24 animate-fade-in">
      <Navbar />

      {/* Header Segment */}
      <div className="pt-28 pb-10 max-w-4xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-3 text-red-500 font-extrabold text-xs tracking-widest uppercase">
          <span>🧠 BRAIN BUSTER</span>
          <span className="text-zinc-700">•</span>
          <span>CINEPHILE DECK</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
          Cinephile <span className="text-red-500 glow-red">Trivia</span>
        </h1>
        <p className="text-zinc-400 text-sm max-w-2xl font-medium leading-relaxed">
          Put your deep cinema wisdom to the ultimate test. Answer rotating trivia questions correctly to level up and unlock the legendary Trivia Champion Badge!
        </p>
      </div>

      <div className="max-w-xl mx-auto px-6">
        
        {/* Game State Welcome Box */}
        {gameState === 'welcome' && (
          <div className="glass-panel p-8 rounded-3xl text-center space-y-6 flex flex-col items-center justify-center min-h-[350px]">
            <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 text-3xl shadow-inner mb-2 animate-bounce">
              🎬
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold tracking-tight">Are You a True Movie Oracle?</h3>
              <p className="text-zinc-500 text-xs font-semibold max-w-sm mx-auto leading-relaxed">
                The challenge deck features 5 curated film questions. Scoring 80% or above (4/5) unlocks the rare, shiny Trivia Champion badge in your Achievements Vault.
              </p>
            </div>
            <button
              onClick={startChallenge}
              className="px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm rounded-2xl transition duration-200 glow-btn-red active:scale-98 cursor-pointer"
            >
              Begin Trivia Challenge
            </button>
          </div>
        )}

        {/* Game State Playing Card */}
        {gameState === 'playing' && questions.length > 0 && (
          <div className="glass-panel p-6 rounded-3xl space-y-6 animate-slide-in">
            
            {/* Top Info Header */}
            <div className="flex justify-between items-center text-xs font-black text-zinc-500 border-b border-zinc-900 pb-3">
              <span className="uppercase">Question {currentIndex + 1} of 5</span>
              <span className="text-red-500 font-mono">Score: {score}</span>
            </div>

            {/* Question Text block */}
            <h3 className="text-lg font-black text-zinc-150 leading-snug">
              {questions[currentIndex].question}
            </h3>

            {/* Answer option buttons */}
            <div className="grid grid-cols-1 gap-2.5">
              {questions[currentIndex].options.map((option) => {
                const isSelected = selectedOption === option
                const isCorrect = option === questions[currentIndex].answer
                
                let buttonStyle = 'bg-zinc-900/40 border-zinc-850 hover:bg-zinc-900/80 hover:text-white text-zinc-300'
                
                if (answered) {
                  if (isCorrect) {
                    buttonStyle = 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300 shadow-md shadow-emerald-950/20'
                  } else if (isSelected) {
                    buttonStyle = 'bg-rose-950/30 border-rose-500/50 text-rose-300 shadow-md shadow-rose-950/20'
                  } else {
                    buttonStyle = 'bg-zinc-950/50 border-zinc-900/60 text-zinc-600 opacity-60'
                  }
                }

                return (
                  <button
                    key={option}
                    disabled={answered}
                    onClick={() => handleOptionSelect(option)}
                    className={`w-full text-left p-4 rounded-2xl border text-xs font-bold transition-all relative flex justify-between items-center ${buttonStyle} ${
                      !answered ? 'cursor-pointer active:scale-99' : 'cursor-default'
                    }`}
                  >
                    <span>{option}</span>
                    
                    {/* Visual markers when answered */}
                    {answered && isCorrect && (
                      <span className="text-xs text-emerald-400">✓ Correct</span>
                    )}
                    {answered && isSelected && !isCorrect && (
                      <span className="text-xs text-rose-400">✗ Incorrect</span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Factoid Details Expander */}
            {answered && (
              <div className="p-4 bg-zinc-950/80 border border-zinc-900 rounded-2xl space-y-2 animate-fade-in">
                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">
                  📽️ CINEMATIC FACT
                </span>
                <p className="text-[10px] text-zinc-400 font-semibold leading-relaxed">
                  {questions[currentIndex].fact}
                </p>
              </div>
            )}

            {/* Next question trigger */}
            {answered && (
              <button
                onClick={nextQuestion}
                className="w-full bg-zinc-100 hover:bg-white text-zinc-950 font-black text-xs py-3.5 rounded-2xl transition duration-200 flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer"
              >
                {currentIndex < questions.length - 1 ? 'Advance Question' : 'Complete Challenge'}
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

          </div>
        )}

        {/* Game State Ended Screen */}
        {gameState === 'ended' && (
          <div className="glass-panel p-8 rounded-3xl text-center space-y-6 flex flex-col items-center justify-center min-h-[380px] animate-slide-in">
            
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Trivia Results</span>
              <h3 className="text-3xl font-black text-white mt-1">
                Challenge Complete!
              </h3>
            </div>

            {/* Huge Score bubble */}
            <div className="w-28 h-28 rounded-full bg-zinc-900 border-2 border-zinc-800 flex flex-col items-center justify-center shadow-inner relative">
              <span className="text-3xl font-black text-red-500 glow-red leading-none">{score}</span>
              <span className="text-[10px] font-black text-zinc-500 uppercase mt-1">out of 5</span>
            </div>

            {/* User Rank assessment */}
            <div className="space-y-1.5 max-w-sm mx-auto">
              <h4 className={`text-base font-extrabold ${summary.style}`}>{summary.title}</h4>
              <p className="text-[10px] text-zinc-500 font-semibold leading-relaxed">
                {summary.desc}
              </p>
            </div>

            {/* Locked vs Unlocked Badge feedback */}
            {score >= 4 ? (
              <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 text-[10px] font-black rounded-2xl flex items-center gap-2">
                <span>👑</span> Trivia Champion badge unlocked in Achievements Vault!
              </div>
            ) : (
              <div className="p-3 bg-zinc-900/30 border border-zinc-900 text-zinc-500 text-[10px] font-bold rounded-2xl">
                🔒 Score 4/5 (80%) or more to unlock the Trivia Champion badge.
              </div>
            )}

            {/* Action buttons */}
            <div className="w-full grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={startChallenge}
                className="w-full bg-red-650 hover:bg-red-700 text-white font-extrabold text-xs py-3 rounded-xl transition duration-200 active:scale-98 cursor-pointer"
              >
                Play Again
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="w-full bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 font-bold text-xs py-3 rounded-xl transition duration-200 active:scale-98 cursor-pointer"
              >
                Go to Profile
              </button>
            </div>

          </div>
        )}

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

export default Trivia
