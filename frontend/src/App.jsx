import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { toast } from 'react-hot-toast'

// Context
import { ThemeProvider } from './context/ThemeContext'

// Layout
import AppBackground from './components/layout/AppBackground'
import ScrollToTop from './components/ScrollToTop'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

// Asosiy sahifalar
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Favorites from './pages/Favorites'
import About from './pages/About'
import Contact from './pages/Contact'

// Auth sahifalar
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import OtpVerify from './pages/auth/OtpVerify'
import GoogleSuccess from './pages/auth/GoogleSuccess'

// Boshqa sahifalar
import Checkout from './pages/checkout/Checkout'
import Profile from './pages/profile/Profile'
import ReadyProducts from './pages/ReadyProducts'
import ReadyProductDetail from './pages/ReadyProductDetail'

import { useScrollLock } from './hooks/useScrollLock'
import { useApp } from './context/AppContext'

// Himoyalangan route — token yo'q bo'lsa /login ga
function PrivateRoute({ children }) {
  const { isAuthenticated } = useApp()
  const [checked, setChecked] = useState(false)
  
  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error("Iltimos, avval tizimga kiring!")
    }
    setChecked(true)
  }, [])
  
  if (!checked) return null
  if (!isAuthenticated()) return <Navigate to="/login" replace />
  return children
}

// Asosiy layout (navbar + footer bor)
function MainLayout() {
  useScrollLock(false)
  return (
    <div className="min-h-screen relative text-[#777]">
      <AppBackground />
      <Navbar transparent />
      <main className="relative">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/ready-products" element={<ReadyProducts />} />
          <Route path="/ready-product/:id" element={<ReadyProductDetail />} />
          <Route path="/profile" element={
            <PrivateRoute><Profile /></PrivateRoute>
          } />
          <Route path="/checkout" element={
            <PrivateRoute><Checkout /></PrivateRoute>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#161b2a',
              color: '#fff',
              padding: '14px 20px',
              borderRadius: '16px',
              fontSize: '14px',
              fontWeight: '500',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            },
            error: { icon: '⚠️', style: { border: '1px solid rgba(239,68,68,0.3)' } },
            success: { icon: '✅' },
          }}
        />
        <ScrollToTop />
        <Routes>
          {/* Auth sahifalar — minimal UI */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<OtpVerify />} />
          <Route path="/auth/google/success" element={<GoogleSuccess />} />

          {/* Asosiy sayt */}
          <Route path="/*" element={<MainLayout />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
