import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, ShoppingCart, Check } from 'lucide-react'
import { useApp } from '../context/AppContext'
import StarRating from './product/StarRating'
import { toast } from 'react-hot-toast'
import { getImageUrl } from '../utils/image'

const BADGE = {
  HOT: 'bg-red-500/90',
  NEW: 'bg-emerald-500/90',
  SALE: 'bg-orange-500/90',
  BEST: 'bg-violet-500/90',
}

export default function ProductCard({ product, index = 0 }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { toggleFav, isFav, getUserRating, hasUserRating, setProductRating, addCart, updateCartQty, cart, isAuthenticated } = useApp()
  const [hovered, setHovered] = useState(false)
  const [cartAdded, setCartAdded] = useState(false)
  const fav = isFav(product.id)
  const displayRating = hasUserRating(product.id) ? getUserRating(product.id) : Math.round(product.rating)
  const fmt = (n) => `${n?.toLocaleString('uz-UZ')} ${t('common.currency')}`

  const cartItem = cart.find(item => String(item.id) === String(product.id))
  const inCart = !!cartItem
  const qty = cartItem ? cartItem.qty : 0

  const handleAddCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated()) {
      toast.error(t('auth.login_title'))
      navigate('/login')
      return
    }
    const added = addCart(product, 1)
    if (added) {
      setCartAdded(true)
      toast.success(t('sections.add_to_cart'))
      setTimeout(() => setCartAdded(false), 1800)
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: (index % 8) * 0.05, ease: 'easeOut' }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="h-full flex flex-col"
    >
      <div className="product-card group flex flex-col h-full bg-white/[0.06] border border-white/12 rounded-[15px] overflow-hidden transition-all duration-300 hover:border-white/22 hover:shadow-[0_16px_40px_rgba(0,0,0,0.35)] hover:-translate-y-1">
        <Link to={`/product/${product.id}`} className="block relative aspect-[4/3] bg-white/5 overflow-hidden">
          {product.badge && (
            <span className={`absolute top-3 left-3 z-10 px-2 py-0.5 ${BADGE[product.badge]} text-white text-[10px] font-bold uppercase rounded-md`}>
              {product.badge}
            </span>
          )}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFav(product) }}
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
            className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-xl bg-black/50 backdrop-blur-md border border-white/10 transition-all hover:scale-110"
          >
            <Heart size={16} fill={fav ? 'currentColor' : 'none'} className={fav ? 'text-red-400' : 'text-white/80'} />
          </button>
          <motion.img
            src={getImageUrl(product)}
            alt={product.name}
            animate={{ scale: hovered ? 1.05 : 1 }}
            transition={{ duration: 0.45 }}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
        </Link>

        <div className="p-4 flex flex-col flex-1">
          <Link to={`/product/${product.id}`} className="block flex-1">
            <p className="text-white/45 text-[10px] uppercase tracking-wider mb-1">{product.cat}</p>
            <h3 className="text-white font-medium text-sm leading-snug mb-2 line-clamp-2 group-hover:text-teal transition-colors">
              {product.name}
            </h3>
          </Link>

          <div
            className="flex items-center gap-2 mb-3"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.preventDefault()}
          >
            <StarRating
              value={displayRating}
              onChange={(stars) => setProductRating(product.id, stars)}
              size={16}
            />
            <span className="text-white/35 text-[10px]">({product.reviews})</span>
          </div>

          <div className="pt-2 border-t border-white/8">
            <div className="flex items-end justify-between gap-2 mb-3">
              <div>
                <div className="text-white font-bold text-[15px]">{fmt(product.price)}</div>
                {product.oldPrice && <div className="text-white/30 text-xs line-through">{fmt(product.oldPrice)}</div>}
                {!product.inStock && (
                  <span className="text-red-400/90 text-[10px] font-semibold uppercase mt-1 block">{t('product.outstock')}</span>
                )}
              </div>
            </div>

            {/* Add to cart / Quantity controls */}
            {inCart ? (
              <div className="flex items-center justify-between gap-2 h-9">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateCartQty(product.id, qty - 1); }}
                  className="w-9 h-full flex items-center justify-center bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  -
                </motion.button>
                <span className="text-white font-semibold flex-1 text-center">{qty}</span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateCartQty(product.id, qty + 1); }}
                  className="w-9 h-full flex items-center justify-center bg-primary/20 text-primary border border-primary/30 rounded-lg hover:bg-primary/30 transition-colors"
                >
                  +
                </motion.button>
              </div>
            ) : (
              <motion.button
                type="button"
                onClick={handleAddCart}
                disabled={!product.inStock}
                whileTap={product.inStock ? { scale: 0.95 } : {}}
                className={`w-full py-2 h-9 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
                  !product.inStock
                    ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                    : cartAdded
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25 hover:border-primary/40'
                }`}
              >
                <AnimatePresence mode="wait">
                  {cartAdded ? (
                    <motion.span
                      key="check"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="flex items-center gap-1.5"
                    >
                      <Check size={13} /> {t('sections.add_to_cart')}
                    </motion.span>
                  ) : (
                    <motion.span
                      key="cart"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="flex items-center gap-1.5"
                    >
                      <ShoppingCart size={13} /> {t('sections.add_to_cart')}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  )
}
