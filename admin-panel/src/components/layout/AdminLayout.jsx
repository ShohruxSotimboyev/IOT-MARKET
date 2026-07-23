import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  Settings, LogOut, Menu, Sun, Moon, Bell,
  Search, MessageSquare, Image as ImageIcon, Zap, Truck, Archive
} from 'lucide-react'
import { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from 'react-i18next'

const LANGS = ['uz', 'ru', 'en']

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { t, i18n } = useTranslation()

  const handleLogout = () => { logout(); navigate('/login') }
  const cycleLang = () => {
    const idx = LANGS.indexOf(i18n.language)
    i18n.changeLanguage(LANGS[(idx + 1) % LANGS.length])
  }

  const NAV_ITEMS = [
    { path: '/dashboard', icon: LayoutDashboard, key: 'dashboard' },
    { path: '/inventory', icon: Archive, key: 'inventory' },
    { path: '/categories', icon: Package, key: 'categories' },
    { path: '/suppliers', icon: Truck, key: 'suppliers' },
    { path: '/products', icon: Package, key: 'products' },
    { path: '/orders', icon: ShoppingCart, key: 'orders' },
    { path: '/customers', icon: Users, key: 'customers' },
    { path: '/messages', icon: MessageSquare, key: 'messages' },
    { path: '/banners', icon: ImageIcon, key: 'banners' },
    { path: '/settings', icon: Settings, key: 'settings' },
  ]

  return (
    <div className="al-wrap">
      {/* Sidebar */}
      <aside className={`al-sidebar${collapsed ? ' collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}>
        <div className="al-sidebar-inner">
          <div className="al-logo">
            <div className="al-logo-icon"><Zap size={18} /></div>
            <div className="al-logo-text">
              <div className="al-logo-title">IoT Market</div>
              <div className="al-logo-sub">Admin Panel</div>
            </div>
          </div>

          <nav className="al-nav">
            <div className="al-nav-section">
              {NAV_ITEMS.map(({ path, icon: Icon, key, badge }) => {
                if (key === 'settings' && user?.role !== 'superadmin') return null;
                return (
                  <NavLink
                    key={path}
                    to={path}
                    className={({ isActive }) => `al-nav-item${isActive ? ' active' : ''}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon size={18} className="al-nav-icon" />
                    <span className="al-nav-text">{t(`nav.${key}`)}</span>
                    {badge && !collapsed && <span className="al-nav-badge">{badge}</span>}
                  </NavLink>
                );
              })}
            </div>
          </nav>

          <div className="al-sidebar-footer">
            <div className="al-user-card">
              <div className="al-avatar">{(user?.username?.[0] || 'A').toUpperCase()}</div>
              <div className="al-user-info">
                <div className="al-user-name">{user?.username || 'Admin'}</div>
                <div className="al-user-role">{user?.role || 'Administrator'}</div>
              </div>
            </div>
            <button className="al-logout-btn" onClick={handleLogout}>
              <LogOut size={16} />
              <span>{t('nav.logout')}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className={`al-main${collapsed ? ' expanded' : ''}`}>
        <header className="al-topbar">
          <div className="al-topbar-left">
            <button
              className="al-collapse-btn"
              onClick={() => window.innerWidth < 1024 ? setMobileOpen(!mobileOpen) : setCollapsed(!collapsed)}
            >
              <Menu size={18} />
            </button>
            <div className="al-search">
              <Search size={15} className="al-search-icon" />
              <input placeholder={t('common.search') + '...'} />
            </div>
          </div>
          <div className="al-topbar-right">
            <button className="al-lang-selector" onClick={cycleLang}>
              {(i18n.language || 'uz').toUpperCase().slice(0,2)}
            </button>
            <button className="al-icon-btn" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button className="al-icon-btn">
              <Bell size={16} />
              <span className="al-notif-dot" />
            </button>
          </div>
        </header>

        <div className="al-page">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="al-mobile-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
