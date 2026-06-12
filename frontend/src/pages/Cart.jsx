import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Minus, Plus, ShoppingBag, X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useApp } from '../context/AppContext'

export default function Cart() {
  const { t } = useTranslation()
  const { cart, updateCartQty, removeCart, clearCart, isAuthenticated } = useApp()
  const navigate = useNavigate()

  const fmt = (n) => `${n.toLocaleString('uz-UZ')} ${t('common.currency')}`
  const grandTotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const totalItems = cart.reduce((s, i) => s + i.qty, 0)

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 pt-32 md:pt-36 pb-16">
      <div className="flex items-center justify-between mb-8 gap-4">
        <h1 className="text-white font-display font-bold text-3xl flex items-center gap-3">
          <ShoppingBag size={28} className="text-teal" />
          {t('cart.title')}
        </h1>
        {cart.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-400 border border-red-400/30 rounded-xl hover:bg-red-400/10 transition-colors"
          >
            <Trash2 size={16} />
            {t('cart.clear')}
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-20 rounded-[15px] border border-white/12 bg-white/[0.04]">
          <ShoppingBag size={48} className="mx-auto text-white/20 mb-4" />
          <p className="text-white/45 text-lg mb-6">{t('cart.empty')}</p>
          <Link to="/products" className="inline-flex px-6 py-3 bg-gradient-to-r from-primary to-teal text-white font-bold rounded-xl">
            {t('nav.products')}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {cart.map((item) => {
              const lineTotal = item.price * item.qty
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  className="rounded-[15px] border border-white/12 bg-white/[0.06] p-4 md:p-5"
                >
                  <div className="flex gap-4">
                    <Link to={`/product/${item.id}`} className="shrink-0">
                      <img src={item.img} alt={item.name} className="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover border border-white/10" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <Link to={`/product/${item.id}`} className="text-white font-semibold text-sm md:text-base hover:text-teal line-clamp-2">
                          {item.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeCart(item.id)}
                          className="p-2 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg shrink-0"
                          aria-label={t('cart.remove')}
                        >
                          <X size={18} />
                        </button>
                      </div>
                      <p className="text-white/40 text-xs mt-1">{item.cat}</p>

                      <div className="mt-3 space-y-1.5 text-sm">
                        <div className="flex justify-between text-white/55">
                          <span>{t('cart.unit_price')}</span>
                          <span className="text-white font-medium">{fmt(item.price)}</span>
                        </div>
                        <div className="flex justify-between text-white/55">
                          <span>{t('cart.quantity')}</span>
                          <div className="flex items-center gap-1 rounded-lg border border-white/12 bg-white/5 p-0.5">
                            <button
                              type="button"
                              onClick={() => updateCartQty(item.id, item.qty - 1)}
                              className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-md"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-white font-bold w-8 text-center">{item.qty}</span>
                            <button
                              type="button"
                              onClick={() => updateCartQty(item.id, item.qty + 1)}
                              className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-md"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-white/10">
                          <span className="text-white/70 font-medium">
                            {item.qty} {t('cart.pcs')} × {fmt(item.price)}
                          </span>
                          <span className="text-teal font-bold">{t('cart.line_total')}: {fmt(lineTotal)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          <div className="rounded-[15px] border border-white/12 bg-white/[0.08] p-6 md:p-8 mt-6">
            <div className="space-y-2 mb-6 text-sm">
              <div className="flex justify-between text-white/55">
                <span>{t('cart.items_count')}</span>
                <span className="text-white">{totalItems} {t('cart.pcs')}</span>
              </div>
              <div className="flex justify-between text-white/55">
                <span>{t('cart.products_count')}</span>
                <span className="text-white">{cart.length}</span>
              </div>
            </div>
            <div className="flex justify-between items-end border-t border-white/15 pt-4 mb-6">
              <span className="text-white font-semibold text-lg">{t('cart.total')}</span>
              <span className="text-white font-display font-bold text-2xl md:text-3xl text-teal">{fmt(grandTotal)}</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => {
                if (!isAuthenticated()) {
                  toast.error("To'lov uchun tizimga kiring!")
                  navigate('/login')
                  return
                }
                navigate('/checkout', { state: { product: { name: `Savat (${totalItems} mahsulot)` }, price: grandTotal } })
              }}
              className="w-full py-4 bg-gradient-to-r from-primary to-teal text-white font-bold text-lg rounded-xl shadow-lg shadow-primary/20"
            >
              {t('cart.checkout')} →
            </motion.button>
          </div>
        </div>
      )}
    </div>
  )
}
