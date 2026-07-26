import { createContext, useContext, useState, useEffect } from 'react'
import apiClient from '../api/client'

const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('admin-user')) } catch { return null }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('admin-token')
    if (token) {
      apiClient.get('/auth/admin-verify')
        .then(res => {
          if (res.data.success && res.data.user) {
            setUser(res.data.user)
            localStorage.setItem('admin-user', JSON.stringify(res.data.user))
          }
        })
        .catch(() => {
          localStorage.removeItem('admin-token')
          localStorage.removeItem('admin-refresh-token')
          localStorage.removeItem('admin-user')
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const response = await apiClient.post('/auth/admin-login', { email, password })
    const data = response.data
    const token = data.accessToken || data.token
    const userData = data.user || { email }
    if (!token) throw new Error('Token kelmadi')
    localStorage.setItem('admin-token', token)
    if (data.refreshToken) {
      localStorage.setItem('admin-refresh-token', data.refreshToken)
    }
    localStorage.setItem('admin-user', JSON.stringify(userData))
    setUser(userData)
    localStorage.removeItem('token')
    localStorage.removeItem('iot_user')
    return userData
  }

  const logout = () => {
    localStorage.removeItem('admin-token')
    localStorage.removeItem('admin-refresh-token')
    localStorage.removeItem('admin-user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
