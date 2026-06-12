import { createContext, useContext, useState } from 'react'
import axios from 'axios'

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([])
  const [favorites, setFavorites] = useState([])

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === product.id)
      if (exists) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...product, qty: 1 }]
    })
  }

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id))

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    // Optimistic UI update
    setCart(prev => prev.map(item => 
      item.id === productId ? { ...item, qty: newQuantity } : item
    ));

    try {
      // Backend API ga so'rov yuborish
      const response = await axios.put('/api/cart/update', {
        productId,
        quantity: newQuantity
      });
      
      // Agar backend dan aniq ma'lumot qaytsa, state ni shunga moslashtirish mumkin
      // if (response.data.success) { ... }
    } catch (error) {
      console.error("Savatni yangilashda xatolik yuz berdi:", error);
      // Agar xatolik bo'lsa, foydalanuvchiga xabar berish yoki orqaga qaytarish mumkin
    }
  }

  const toggleFavorite = (product) => {
    setFavorites(prev =>
      prev.find(i => i.id === product.id)
        ? prev.filter(i => i.id !== product.id)
        : [...prev, product]
    )
  }

  const isFavorite = (id) => favorites.some(i => i.id === id)
  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0)
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0)

  return (
    <CartContext.Provider value={{ cart, favorites, addToCart, removeFromCart, updateQuantity, toggleFavorite, isFavorite, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
