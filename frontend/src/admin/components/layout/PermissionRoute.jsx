import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const PERMISSION_MAP = {
  '/dashboard': 'dashboard',
  '/inventory': 'inventory',
  '/categories': 'products',
  '/suppliers': 'products',
  '/products': 'products',
  '/orders': 'orders',
  '/reviews': 'reviews',
  '/ready-products': 'products',
  '/customers': 'customers',
  '/messages': 'messages',
  '/banners': 'banners',
  '/managers': 'managers',
  '/settings': 'settings',
}

export default function PermissionRoute({ children, path }) {
  const { user } = useAuth()
  
  // Superadmin has access to everything
  if (user?.role === 'superadmin') {
    return children
  }
  
  // Managers need specific permissions
  if (user?.role === 'manager') {
    const requiredPermission = PERMISSION_MAP[path]
    
    // Dashboard is always accessible
    if (path === '/dashboard') {
      return children
    }
    
    // Check if manager has the required permission
    const permissions = user?.permissions || []
    if (permissions.includes(requiredPermission)) {
      return children
    }
    
    // Manager doesn't have permission - redirect to dashboard
    return <Navigate to="/admin/dashboard" replace />
  }
  
  // Default redirect
  return <Navigate to="/admin/dashboard" replace />
}
