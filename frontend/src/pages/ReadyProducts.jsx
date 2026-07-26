import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShoppingCart, Heart, Check, Cpu, Star } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { getImageUrl } from '../utils/image'
import ProductSkeleton from '../components/common/ProductSkeleton'
import { toast } from 'react-hot-toast'
import api from '../api/axios'

const BADGE = {
  HOT: 'bg-red-500/90',
  NEW: 'bg-emerald-500/90',
  SALE: 'bg-orange-500/90',
}

function ReadyProductCard({ product, index = 0 }) {
  const { t } = useTranslation()
  const { addCart, cart, updateCartQty, toggleFav, isFav } = useApp()
  const [hovered, setHovered] = useState(false)
  const [cartAdded, setCartAdded] = useState(false)
  const fav = isFav(product.id)
  const fmt = (n) => `${n?.toLocaleString('uz-UZ')} ${t('common.currency')}`
  const cartItem = cart.find(item => String(item.id) === String(product.id))
  const inCart = !!cartItem
  const qty = cartItem ? cartItem.qty : 0

  const handleAddCart = (e) => {
    e.preventDefault()
    const added = addCart({ ...product, cat: product.category?.name || '' }, 1)
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
        <Link to={`/ready-product/${product.id}`} className="block relative aspect-[4/3] bg-white/5 overflow-hidden">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); toggleFav({ ...product, cat: product.category?.name || '' }) }}
            className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-xl bg-black/50 backdrop-blur-md border border-white/10 transition-all hover:scale-110"
          >
            <Heart size={16} fill={fav ? 'currentColor' : 'none'} className={fav ? 'text-red-400' : 'text-white/80'} />
          </button>
          <motion.img
            src={product.image || 'https://placehold.co/400x400/1a1a1a/cccccc?text=IoT'}
            alt={product.name}
            animate={{ scale: hovered ? 1.05 : 1 }}
            transition={{ duration: 0.45 }}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
        </Link>

        <div className="p-4 flex flex-col flex-1">
          <p className="text-white/45 text-[10px] uppercase tracking-wider mb-1">{product.category?.name || 'Tayyor mahsulot'}</p>
          <h3 className="text-white font-medium text-sm leading-snug mb-2 line-clamp-2 group-hover:text-teal transition-colors">
            {product.name}
          </h3>

          {product.features?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {product.features.slice(0, 3).map((f, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md bg-white/8 text-white/50 text-[10px]">{f}</span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={13} fill={s <= Math.round(product.rating) ? '#facc15' : 'none'} stroke={s <= Math.round(product.rating) ? '#facc15' : 'rgba(255,255,255,0.2)'} />
              ))}
            </div>
            <span className="text-white/35 text-[10px]">({product.reviews || 0})</span>
          </div>

          <div className="pt-2 border-t border-white/8 mt-auto">
            <div className="flex items-end justify-between gap-2 mb-3">
              <div>
                <div className="text-white font-bold text-[15px]">{fmt(product.price)}</div>
                {product.oldPrice > 0 && <div className="text-white/30 text-xs line-through">{fmt(product.oldPrice)}</div>}
                {!product.inStock && (
                  <span className="text-red-400/90 text-[10px] font-semibold uppercase mt-1 block">{t('product.outstock')}</span>
                )}
              </div>
            </div>

            {inCart ? (
              <div className="flex items-center justify-between gap-2 h-9">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.preventDefault(); updateCartQty(product.id, qty - 1) }}
                  className="w-9 h-full flex items-center justify-center bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  -
                </motion.button>
                <span className="text-white font-semibold flex-1 text-center">{qty}</span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.preventDefault(); updateCartQty(product.id, qty + 1) }}
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
                {cartAdded ? (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1.5">
                    <Check size={13} /> {t('sections.add_to_cart')}
                  </motion.span>
                ) : (
                  <motion.span initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center gap-1.5">
                    <ShoppingCart size={13} /> {t('sections.add_to_cart')}
                  </motion.span>
                )}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  )
}

export default function ReadyProducts() {
  const { t } = useTranslation()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/ready-products?limit=50&status=active')
      .then(res => {
        setProducts(res.data?.data || [])
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 pt-32 md:pt-36 pb-16">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-teal flex items-center justify-center">
            <Cpu size={20} className="text-white" />
          </div>
          <h1 className="text-white font-display font-bold text-3xl md:text-4xl">
            {t('nav.readyProducts', 'Tayyor mahsulotlar')}
          </h1>
        </div>
        <p className="text-white/50 text-sm md:text-base max-w-xl">
          {t('readyProducts.subtitle', 'Tayyor IoT qurilmalari va to\'plamlar — o\'rnatishga tayyor, darhol ishlatish mumkin')}
        </p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
          {Array(8).fill(0).map((_, i) => <ProductSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-white/40">
          <Cpu size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg">{t('readyProducts.empty', 'Hozircha tayyor mahsulotlar yo\'q')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
          {products.map((p, i) => (
            <ReadyProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
