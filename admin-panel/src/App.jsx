import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'
import AdminLayout from './components/layout/AdminLayout'
import PermissionRoute from './components/layout/PermissionRoute'
import Login from './pages/auth/Login'
import Dashboard from './pages/dashboard/Dashboard'
import Inventory from './pages/inventory/Inventory'
import Categories from './pages/categories/Categories'
import Suppliers from './pages/suppliers/Suppliers'
import Products from './pages/products/Products'
import Orders from './pages/orders/Orders'
import Customers from './pages/customers/Customers'
import Messages from './pages/messages/Messages'
import Banners from './pages/banners/Banners'
import Settings from './pages/settings/Settings'
import Managers from './pages/managers/Managers'
import Reviews from './pages/reviews/Reviews'
import ReadyProducts from './pages/readyProducts/ReadyProducts'
import './i18n'
import './index.css'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-default)',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '13px',
              },
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<PermissionRoute path="/dashboard"><Dashboard /></PermissionRoute>} />
              <Route path="inventory" element={<PermissionRoute path="/inventory"><Inventory /></PermissionRoute>} />
              <Route path="categories" element={<PermissionRoute path="/categories"><Categories /></PermissionRoute>} />
              <Route path="suppliers" element={<PermissionRoute path="/suppliers"><Suppliers /></PermissionRoute>} />
              <Route path="products" element={<PermissionRoute path="/products"><Products /></PermissionRoute>} />
              <Route path="orders" element={<PermissionRoute path="/orders"><Orders /></PermissionRoute>} />
              <Route path="customers" element={<PermissionRoute path="/customers"><Customers /></PermissionRoute>} />
              <Route path="messages" element={<PermissionRoute path="/messages"><Messages /></PermissionRoute>} />
              <Route path="banners" element={<PermissionRoute path="/banners"><Banners /></PermissionRoute>} />
              <Route path="managers" element={<PermissionRoute path="/managers"><Managers /></PermissionRoute>} />
              <Route path="reviews" element={<PermissionRoute path="/reviews"><Reviews /></PermissionRoute>} />
              <Route path="ready-products" element={<PermissionRoute path="/ready-products"><ReadyProducts /></PermissionRoute>} />
              <Route path="settings" element={<PermissionRoute path="/settings"><Settings /></PermissionRoute>} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
