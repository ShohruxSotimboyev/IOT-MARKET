import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, ShoppingBag, Heart, LogOut, Edit2, Check, X, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useApp } from '../../context/AppContext'
import api from '../../api/axios'

export default function Profile() {
  const { t } = useTranslation()
  const { user, logout, updateUser, cart, favs } = useApp()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')

  useEffect(() => {
    setName(user?.name || '')
    setPhone(user?.phone || '')
  }, [user])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setOrdersLoading(true)
      api.get('/orders')
        .then(res => setOrders(res.data?.orders || []))
        .catch(() => {})
        .finally(() => setOrdersLoading(false))
    }
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleSave = () => {
    updateUser({ name: name.trim(), phone: phone.trim() })
    setEditing(false)
  }

  if (!user) {
    navigate('/login')
    return null
  }

  const avatar = user.name?.[0]?.toUpperCase() || 'U'
  const cartCount = cart.reduce((s, i) => s + i.qty, 0)

  return (
    <div className="max-w-2xl mx-auto px-4 pt-32 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[20px] border border-white/12 bg-white/[0.04] backdrop-blur-xl overflow-hidden"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-primary/30 to-teal/20 px-8 py-10 flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-teal flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {avatar}
          </div>
          <div>
            <h1 className="text-white text-2xl font-bold">{user.name}</h1>
            <p className="text-white/50 text-sm mt-1 flex items-center gap-1">
              <ShieldCheck size={14} className="text-teal" />
              {t('profile.verified')}
            </p>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="absolute top-6 right-6 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all"
          >
            <Edit2 size={16} />
          </button>
        </div>

        {/* Ma'lumotlar */}
        <div className="px-8 py-6 space-y-4">
          <h2 className="text-white/40 text-xs uppercase tracking-wider font-semibold mb-4">{t('profile.personal')}</h2>

          {/* Ism */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.04] border border-white/8">
            <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
              <User size={16} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-white/40 text-xs mb-1">{t('profile.name')}</p>
              {editing ? (
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-transparent text-white border-b border-teal/50 outline-none text-sm pb-0.5"
                />
              ) : (
                <p className="text-white text-sm font-medium">{user.name}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.04] border border-white/8">
            <div className="w-9 h-9 rounded-lg bg-teal/20 flex items-center justify-center">
              <Mail size={16} className="text-teal" />
            </div>
            <div className="flex-1">
              <p className="text-white/40 text-xs mb-1">{t('profile.email')}</p>
              <p className="text-white text-sm font-medium">{user.email}</p>
            </div>
          </div>

          {/* Telefon */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.04] border border-white/8">
            <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Phone size={16} className="text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-white/40 text-xs mb-1">{t('profile.phone')}</p>
              {editing ? (
                <input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+998 __ ___ __ __"
                  className="w-full bg-transparent text-white border-b border-teal/50 outline-none text-sm pb-0.5"
                />
              ) : (
                <p className="text-white text-sm font-medium">{user.phone || t('profile.not_entered')}</p>
              )}
            </div>
          </div>

          {/* Saqlash tugmalari */}
          {editing && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 pt-2"
            >
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary to-teal text-white font-semibold rounded-xl text-sm"
              >
                <Check size={16} /> {t('profile.save')}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-white/8 border border-white/12 text-white/60 rounded-xl text-sm"
              >
                <X size={16} /> {t('profile.cancel')}
              </button>
            </motion.div>
          )}
        </div>

        {/* Buyurtmalar */}
        {(orders.length > 0 || ordersLoading) && (
          <div className="px-8 py-6 border-t border-white/8">
            <h2 className="text-white/40 text-xs uppercase tracking-wider font-semibold mb-4">So'nggi buyurtmalar</h2>
            {ordersLoading ? (
              <div className="space-y-2">
                {[1,2].map(i => <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />)}
              </div>
            ) : (
              <div className="space-y-2">
                {orders.slice(0, 5).map(order => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-white/8">
                    <div>
                      <p className="text-white text-sm font-semibold">#{order.txId || order.id?.slice(-8)}</p>
                      <p className="text-white/40 text-xs">{new Date(order.createdAt).toLocaleDateString('uz-UZ')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-teal font-bold text-sm">{(order.total || 0).toLocaleString()} so'm</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                       {order.status === 'paid' ? "To'langan" : order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Statistika */}
        <div className="px-8 py-6 border-t border-white/8">
          <h2 className="text-white/40 text-xs uppercase tracking-wider font-semibold mb-4">{t('profile.activity')}</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/cart')}
              className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.04] border border-white/8 hover:bg-white/[0.08] transition-all text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <ShoppingBag size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-white font-bold text-xl">{cartCount}</p>
                <p className="text-white/40 text-xs">{t('profile.cart')}</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/favorites')}
              className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.04] border border-white/8 hover:bg-white/[0.08] transition-all text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <Heart size={18} className="text-red-400" />
              </div>
              <div>
                <p className="text-white font-bold text-xl">{favs.length}</p>
                <p className="text-white/40 text-xs">{t('profile.favorites')}</p>
              </div>
            </button>
          </div>
        </div>

        {/* Chiqish */}
        <div className="px-8 py-6 border-t border-white/8">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all font-semibold"
          >
            <LogOut size={18} />
            {t('profile.logout')}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
