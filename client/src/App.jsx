import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Watchlist from './pages/Watchlist'
import Profile from './pages/Profile'
import MovieDetails from './pages/MovieDetails'
import CineMatch from './pages/CineMatch'
import MovieNews from './pages/MovieNews'
import Achievements from './pages/Achievements'
import Trivia from './pages/Trivia'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="/cinematch" element={<CineMatch />} />
        <Route path="/news" element={<MovieNews />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/trivia" element={<Trivia />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App