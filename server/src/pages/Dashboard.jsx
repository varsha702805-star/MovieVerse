import { useNavigate } from 'react-router-dom'

function Dashboard() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="bg-zinc-900 p-4 flex justify-between items-center">
        <h1 className="text-red-600 text-2xl font-bold">MovieVerse</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 px-4 py-2 rounded font-bold"
        >
          Logout
        </button>
      </nav>
      <div className="p-8">
        <h2 className="text-3xl font-bold mb-4">Welcome to MovieVerse! 🎬</h2>
        <p className="text-zinc-400">Movie browsing coming soon...</p>
      </div>
    </div>
  )
}

export default Dashboard