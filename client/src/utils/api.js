import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
})

// Request Interceptor: Automatically inject token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor: Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized request. Logging out user...')
      localStorage.removeItem('token')
      
      // Redirect to login if not already on the login or register page
      const currentPath = window.location.pathname
      if (currentPath !== '/' && currentPath !== '/register') {
        window.location.href = '/'
      }
    }
    return Promise.reject(error)
  }
)

export default api
