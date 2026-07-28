import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api/axios'

const AppContext = createContext()

export function AppProvider({ children }) {
  // User — token dan ham, localStorage dan ham o'qiymiz
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('iot_user')) } catch { return null }
  })
  // Eski {uz, en, ru} object formatidan tozalash
  const sanitizeItem = (item) => {
    const lang = localStorage.getItem('iot_lang') || 'uz'
    const str = (val) => {
      if (!val) return ''
      if (typeof val === 'string') return val
      if (typeof val === 'object') return val[lang] || val.uz || val.en || val.ru || String(val)
      return String(val)
    }
    return { ...item, name: str(item.name), cat: str(item.cat), desc: str(item.desc) }
  }

  const [cart, setCart] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem('iot_cart')) || []
      return raw.map(sanitizeItem)
    } catch { return [] }
  })
  const [favs, setFavs] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem('iot_favs')) || []
      return raw.map(sanitizeItem)
    } catch { return [] }
  })
  const [reviews, setReviews] = useState(() => {
    try { return JSON.parse(localStorage.getItem('iot_reviews')) || {} } catch { return {} }
  })
  const [userRatings, setUserRatings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('iot_ratings')) || {} } catch { return {} }
  })

  // Eski localStorage versiyasini tozalash (bir martalik)
  useEffect(() => {
    const CACHE_VER = 'v2'
    if (localStorage.getItem('iot_cache_ver') !== CACHE_VER) {
      localStorage.removeItem('iot_cart')
      localStorage.removeItem('iot_favs')
      localStorage.setItem('iot_cache_ver', CACHE_VER)
      setCart([])
      setFavs([])
    }
  }, [])


  useEffect(() => { localStorage.setItem('iot_cart', JSON.stringify(cart)) }, [cart])
  useEffect(() => { localStorage.setItem('iot_favs', JSON.stringify(favs)) }, [favs])
  useEffect(() => { localStorage.setItem('iot_reviews', JSON.stringify(reviews)) }, [reviews])
  useEffect(() => { localStorage.setItem('iot_ratings', JSON.stringify(userRatings)) }, [userRatings])

  // Token bor-yo'qligini va valid ekanligini tekshirish
  const isAuthenticated = () => {
    const token = localStorage.getItem('token')
    if (!token) return false

    try {
      // JWT token expiration tekshirish
      const base64Url = token.split('.')[1]
      if (!base64Url) return true // Token bor lekin format boshqacha bo'lishi mumkin

      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join(''))

      const decoded = JSON.parse(jsonPayload)
      const now = Date.now() / 1000

      // Token muddati tugagan bo'lsa
      if (decoded.exp && decoded.exp < now) {
        return false
      }

      return true
    } catch (error) {
      // Token yaroqsiz formatda bo'lsa ham, token bor deb hisoblaymiz
      // Chunki Google tokeni boshqa formatda bo'lishi mumkin
      return true
    }
  }

  // OTP dan keyin chaqiriladi — token va user saqlash
  const setAuthUser = (token, userData) => {
    localStorage.setItem('token', token)  // accessToken
    const u = { id: userData.id || userData._id, name: userData.name || userData.username, email: userData.email, phone: userData.phone }
    setUser(u)
    localStorage.setItem('iot_user', JSON.stringify(u))
  }

  // Login — backendga so'rov, OTP yuboriladi
  const loginRequest = async (identifier, password) => {
    try {
      const res = await api.post('/auth/login', { identifier, password })
      return {
        success: true,
        email: res.data.email || identifier,
        requireVerification: res.data.requireVerification || false,
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Xatolik!' }
    }
  }

  // Mock login - faqat dev uchun, production'da ishlatmang
  const login = (email, password, name) => {
    return false
  }

  const updateUser = (fields) => {
    const updated = { ...user, ...fields }
    setUser(updated)
    localStorage.setItem('iot_user', JSON.stringify(updated))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('iot_user')
    localStorage.removeItem('token')
  }

  // Savatga qo'shish — barcha uchun ishlaydi (localStorage orqali)
  const addCart = (product, qty = 1) => {
    const addQty = product.qty ?? qty
    setCart((prev) => {
      const ex = prev.find((i) => String(i.id) === String(product.id))
      if (ex) return prev.map((i) => (String(i.id) === String(product.id) ? { ...i, qty: i.qty + addQty } : i))
      const { qty: _q, ...rest } = product
      return [...prev, { ...rest, qty: addQty }]
    })
    return true
  }

  const updateCartQty = async (id, qty) => {
    if (qty < 1) { setCart((prev) => prev.filter((i) => String(i.id) !== String(id))); return }
    
    // Optimistic UI update
    setCart((prev) => prev.map((i) => (String(i.id) === String(id) ? { ...i, qty } : i)))

    try {
      if (isAuthenticated()) {
        await api.put('/cart/update', { productId: id, quantity: qty })
      }
    } catch {
    }
  }

  const removeCart = (id) => setCart((prev) => prev.filter((i) => String(i.id) !== String(id)))
  const clearCart = () => setCart([])

  const toggleFav = (product) => {
    setFavs((prev) =>
      prev.find((i) => String(i.id) === String(product.id)) ? prev.filter((i) => String(i.id) !== String(product.id)) : [...prev, product]
    )
  }
  const isFav = (id) => favs.some((i) => String(i.id) === String(id))

  const getProductReviews = useCallback((productId) => reviews[productId] || [], [reviews])

  const addReview = (productId, text, author) => {
    const entry = { id: Date.now(), text: text.trim(), author: author || 'Mehmon', date: new Date().toISOString() }
    setReviews((prev) => ({ ...prev, [productId]: [entry, ...(prev[productId] || [])] }))
    return entry
  }

  const setProductRating = (productId, stars) => {
    setUserRatings((prev) => ({ ...prev, [productId]: Math.max(0, Math.min(5, stars)) }))
  }

  const hasUserRating = (productId) => Object.prototype.hasOwnProperty.call(userRatings, productId)
  const getUserRating = (productId) => (hasUserRating(productId) ? userRatings[productId] : 0)

  return (
    <AppContext.Provider value={{
      user, login, loginRequest, logout, updateUser, isAuthenticated, setAuthUser,
      cart, addCart, updateCartQty, removeCart, clearCart,
      favs, toggleFav, isFav,
      getProductReviews, addReview, setProductRating, getUserRating, hasUserRating,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
