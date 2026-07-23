import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'
import AdminLayout from './components/layout/AdminLayout'
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
import './i18n'
import './index.css'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('admin-token')
  if (!token) return <Navigate to="/login" replace />
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
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="categories" element={<Categories />} />
              <Route path="suppliers" element={<Suppliers />} />
              <Route path="products" element={<Products />} />
              <Route path="orders" element={<Orders />} />
              <Route path="customers" element={<Customers />} />
              <Route path="messages" element={<Messages />} />
              <Route path="banners" element={<Banners />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
