import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, ShoppingBag, Heart, LogOut, Edit2, Check, X, ShieldCheck, Package, Truck, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useApp } from '../../context/AppContext'
import api from '../../api/axios'
import toast from 'react-hot-toast'

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

  const loadOrders = () => {
    const token = localStorage.getItem('token')
    if (token) {
      setOrdersLoading(true)
      api.get('/orders')
        .then(res => setOrders(res.data?.orders || []))
        .catch(() => {})
        .finally(() => setOrdersLoading(false))
    }
  }

  useEffect(() => {
    loadOrders()
    
    // Real-time status updates - polling every 30 seconds
    const interval = setInterval(() => {
      loadOrders()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleCancelOrder = async (orderId) => {
    const order = orders.find(o => o.id === orderId)
    if (!order) return
    
    // Check if order can be cancelled (not delivered)
    if (['delivered', 'completed', 'shipped'].includes(order.status)) {
      toast.error("Bu buyurtma yetkazib berilgan, bekor qilib bo'lmaydi")
      return
    }
    
    if (!window.confirm("Buyurtmani bekor qilmoqchimisiz?")) return
    try {
      await api.patch(`/orders/${orderId}/cancel`)
      loadOrders() // Reload orders to get updated status
      toast.success("Buyurtma bekor qilindi")
    } catch (err) {
      toast.error(err.response?.data?.message || "Bekor qilishda xatolik yuz berdi")
    }
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
            <h2 className="text-white/40 text-xs uppercase tracking-wider font-semibold mb-4">Buyurtmalar tarixi</h2>
            {ordersLoading ? (
              <div className="space-y-2">
                {[1,2].map(i => <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />)}
              </div>
            ) : orders.length === 0 ? (
              <p className="text-white/40 text-sm">Hali buyurtmalar yo'q</p>
            ) : (
              <div className="space-y-3">
                {orders.map(order => {
                  const statusConfig = {
                    pending: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'Kutilmoqda' },
                    paid: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/20', label: "To'langan" },
                    processing: { icon: Package, color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Jarayonda' },
                    shipped: { icon: Truck, color: 'text-purple-400', bg: 'bg-purple-500/20', label: 'Yo\'lda' },
                    delivered: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20', label: 'Yetkazib berildi' },
                    completed: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20', label: 'Tugatildi' },
                    cancelled: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20', label: 'Bekor qilindi' },
                  }
                  const config = statusConfig[order.status] || statusConfig.pending
                  const StatusIcon = config.icon
                  const canCancel = ['pending', 'paid', 'processing'].includes(order.status)
                  
                  return (
                    <div key={order.id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.04] border border-white/8 hover:bg-white/[0.06] transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center`}>
                          <StatusIcon size={18} className={config.color} />
                        </div>
                        <div>
                          <p className="text-white text-sm font-semibold">#{order.txId || order.id?.slice(-8)}</p>
                          <p className="text-white/40 text-xs">{new Date(order.createdAt).toLocaleDateString('uz-UZ')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-teal font-bold text-sm">{(order.total || 0).toLocaleString()} so'm</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${config.bg} ${config.color} font-medium`}>
                          {config.label}
                        </span>
                        {canCancel && (
                          <button 
                            onClick={() => handleCancelOrder(order.id)}
                            className="block mt-2 text-xs text-red-400 hover:text-red-300 transition-colors"
                          >
                            Bekor qilish
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
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
