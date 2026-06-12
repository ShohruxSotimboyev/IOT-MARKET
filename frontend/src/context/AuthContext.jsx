import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('iot_user')
    if (stored) setUser(JSON.parse(stored))
    setLoading(false)
  }, [])

  const login = (email, password) => {
    // Mock auth
    if ((email === 'admin@iot.uz' && password === '123456') || (email && password.length >= 4)) {
      const u = { email, name: email.split('@')[0], id: Date.now() }
      setUser(u)
      localStorage.setItem('iot_user', JSON.stringify(u))
      return true
    }
    return false
  }

  const register = (name, email, password) => {
    if (name && email && password.length >= 4) {
      const u = { email, name, id: Date.now() }
      setUser(u)
      localStorage.setItem('iot_user', JSON.stringify(u))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('iot_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
