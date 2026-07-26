import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin-token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token)
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const data = error.response?.data

    if (error.response?.status === 401 && data?.tokenExpired && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(() => apiClient(originalRequest))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = localStorage.getItem('admin-refresh-token')
        if (!refreshToken) throw new Error('Refresh token yo\'q')

        const refreshRes = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken },
          { withCredentials: true }
        )
        const newToken = refreshRes.data.accessToken || refreshRes.data.token
        if (newToken) {
          localStorage.setItem('admin-token', newToken)
          if (refreshRes.data.refreshToken) {
            localStorage.setItem('admin-refresh-token', refreshRes.data.refreshToken)
          }
        }
        processQueue(null)
        return apiClient(originalRequest)
      } catch {
        processQueue(new Error('Refresh failed'))
        localStorage.removeItem('admin-token')
        localStorage.removeItem('admin-refresh-token')
        localStorage.removeItem('admin-user')
        window.location.href = '/login'
      } finally {
        isRefreshing = false
      }
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('admin-token')
      localStorage.removeItem('admin-refresh-token')
      localStorage.removeItem('admin-user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
