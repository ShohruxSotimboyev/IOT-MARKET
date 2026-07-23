import { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { useApp } from '../../context/AppContext'
import { ChevronRight } from 'lucide-react'
import { PRODUCTS, KITS, CATEGORIES } from '../../data'
import api from '../../api/axios'
import { getImageUrl } from '../../utils/image'
import ProductCard from '../ProductCard'

const MCU_NAMES = ['Arduino', 'ESP Modullar', 'Raspberry Pi']

// Kit card — PopularSections uchun
function KitCard({ kit, index }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { addCart, updateCartQty, cart, isAuthenticated } = useApp()
  const fmt = (n) => `${n?.toLocaleString('uz-UZ')} ${t('common.currency')}`

  const cartItem = cart.find(item => String(item.id) === String(kit.id))
  const inCart = !!cartItem
  const qty = cartItem ? cartItem.qty : 0
  const [cartAdded, setCartAdded] = useState(false)

  const handleAdd = (e) => {
    e.preventDefault(); e.stopPropagation()
    addCart({ ...kit, inStock: true }, 1)
    setCartAdded(true)
    toast.success(t('sections.add_to_cart'))
    setTimeout(() => setCartAdded(false), 1800)
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: (index % 8) * 0.05, ease: 'easeOut' }}
      className="h-full flex flex-col"
    >
      <div className="product-card group flex flex-col h-full bg-white/[0.06] border border-white/12 rounded-[15px] overflow-hidden transition-all duration-300 hover:border-white/22 hover:shadow-[0_16px_40px_rgba(0,0,0,0.35)] hover:-translate-y-1">
        <Link to="/products?group=micro" className="block relative aspect-[4/3] bg-white/5 overflow-hidden">
          {kit.badge && (
            <span className={`absolute top-3 left-3 z-10 px-2 py-0.5 ${kit.badge === 'HOT' ? 'bg-red-500/90' : kit.badge === 'NEW' ? 'bg-emerald-500/90' : 'bg-violet-500/90'} text-white text-[10px] font-bold uppercase rounded-md`}>
              {kit.badge}
            </span>
          )}
          <motion.img
            src={getImageUrl(kit)}
            alt={kit.name}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.45 }}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
        </Link>
        <div className="p-4 flex flex-col flex-1">
          <Link to="/products?group=micro" className="block flex-1">
            <p className="text-white/45 text-[10px] uppercase tracking-wider mb-1">{t('popular.tab_kits')}</p>
            <h3 className="text-white font-medium text-sm leading-snug mb-2 line-clamp-2 group-hover:text-teal transition-colors">{kit.name}</h3>
          </Link>
          <div className="pt-2 border-t border-white/8 mt-auto">
            <div className="flex items-end justify-between gap-2 mb-3">
              <div>
                <div className="text-white font-bold text-[15px]">{fmt(kit.price)}</div>
                <p className="text-white/40 text-xs mt-0.5">{kit.items} {t('common.elements')}</p>
              </div>
            </div>
            {inCart ? (
              <div className="flex items-center justify-between gap-2 h-9">
                <motion.button whileTap={{ scale: 0.9 }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateCartQty(kit.id, qty - 1) }}
                  className="w-9 h-full flex items-center justify-center bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">-</motion.button>
                <span className="text-white font-semibold flex-1 text-center">{qty}</span>
                <motion.button whileTap={{ scale: 0.9 }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateCartQty(kit.id, qty + 1) }}
                  className="w-9 h-full flex items-center justify-center bg-primary/20 text-primary border border-primary/30 rounded-lg hover:bg-primary/30 transition-colors">+</motion.button>
              </div>
            ) : (
              <motion.button type="button" onClick={handleAdd} whileTap={{ scale: 0.95 }}
                className={`w-full py-2 h-9 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
                  cartAdded
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25 hover:border-primary/40'
                }`}>
                {cartAdded ? '✓ ' + t('sections.add_to_cart') : t('sections.add_to_cart')}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  )
}

export default function PopularSections() {
  const { t } = useTranslation()
  const [activeKey, setActiveKey] = useState('arduino')
  const [apiProductMap, setApiProductMap] = useState({})

  useEffect(() => {
    Promise.allSettled(
      MCU_NAMES.map(name =>
        api.get(`/products?category=${encodeURIComponent(name)}&limit=8&status=active`)
          .then(res => ({ name, products: res.data?.data || res.data?.products || [] }))
      )
    ).then(results => {
      const map = {}
      results.forEach(r => {
        if (r.status === 'fulfilled' && r.value.products.length > 0) map[r.value.name] = r.value.products
      })
      if (Object.keys(map).length > 0) setApiProductMap(map)
    })
  }, [])

  const tabs = useMemo(() => {
    return MCU_NAMES.map((name) => {
      const cat = CATEGORIES.find((c) => c.name === name)
      const products = (apiProductMap[name] || PRODUCTS.filter(p => p.cat === name)).slice(0, 8)
      return { key: cat?.key ?? name.toLowerCase().replace(' ', ''), name, type: 'products', count: products.length, items: products, href: `/products?cat=${encodeURIComponent(name)}` }
    }).concat([{
      key: 'kits', name: 'kits', type: 'kits',
      count: KITS.slice(0, 8).length, items: KITS.slice(0, 8), href: '/products?group=micro',
    }])
  }, [apiProductMap])

  const active = tabs.find(tab => tab.key === activeKey) ?? tabs[0]
  const tabLabel = (tab) => tab.key === 'kits' ? t('popular.tab_kits') : t(`categoryNames.${tab.key}`, { defaultValue: tab.name })

  if (!active) return null

  return (
    <section className="py-12 md:py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <motion.h2
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="text-white font-display font-bold text-2xl md:text-4xl flex items-center gap-4"
        >
          <span className="w-1.5 h-10 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
          {t('popular.title')}
        </motion.h2>

        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {tabs.map((tab) => {
            const isActive = tab.key === activeKey
            return (
              <motion.button
                key={tab.key}
                type="button"
                onClick={() => setActiveKey(tab.key)}
                whileTap={{ scale: 0.95 }}
                className={`relative shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 border overflow-hidden ${
                  isActive
                    ? 'text-white border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.15)] bg-cyan-500/10'
                    : 'bg-white/[0.03] text-white/60 border-white/10 hover:border-white/20 hover:text-white hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabBg"
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/10 z-0"
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2.5">
                  {tabLabel(tab)}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${isActive ? 'bg-cyan-500/30 text-cyan-200' : 'bg-white/10 text-white/50'}`}>
                    {tab.count}
                  </span>
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeKey}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.28 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5"
        >
          {active.type === 'kits'
            ? active.items.map((kit, idx) => <KitCard key={kit.id} kit={kit} index={idx} />)
            : active.items.map((product, idx) => <ProductCard key={product.id} product={product} index={idx} />)
          }
        </motion.div>
      </AnimatePresence>

      <div className="mt-10 text-center">
        <Link
          to={active.href}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold text-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        >
          {t('popular.view')}
          <ChevronRight size={18} className="text-cyan-400" />
        </Link>
      </div>
    </section>
  )
}
