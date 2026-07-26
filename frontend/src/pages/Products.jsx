import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X, Loader2 } from 'lucide-react'
import { PRODUCTS, CATEGORIES } from '../data'
import ProductCard from '../components/ProductCard'
import ProductSkeleton from '../components/common/ProductSkeleton'
import CategoryIcon from '../components/common/CategoryIcon'
import ProductFilters from '../components/products/ProductFilters'
import { searchProducts } from '../utils/search'
import { categoryLabel } from '../i18n/helpers'
import { useScrollLock } from '../hooks/useScrollLock'
import { usePersistedState } from '../hooks/usePersistedState'
import api from '../api/axios'

const MCU_CATEGORIES = ['Arduino', 'ESP Modullar', 'Raspberry Pi']
const LIMIT = 24

export default function Products() {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const [cat, setCat] = usePersistedState('iot_products_cat', 'all')
  const [sort, setSort] = usePersistedState('iot_products_sort', 'default')
  const [search, setSearch] = usePersistedState('iot_products_search', '')
  const [mobileFilter, setMobileFilter] = useState(false)

  const [apiProducts, setApiProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [apiReady, setApiReady] = useState(false)
  const [dbCategories, setDbCategories] = useState([])

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  useScrollLock(mobileFilter)

  useEffect(() => {
    const q = params.get('search')
    const c = params.get('cat')
    if (q) setSearch(q)
    if (c) setCat(c)
  }, [params])

  // Kategoriya, qidiruv yoki sort o'zgarganda 1-sahifaga qaytamiz
  useEffect(() => {
    setPage(1)
  }, [cat, search])

  // API dan mahsulotlarni olish (pagination, qidiruv va kategoriya bilan)
  const fetchFromAPI = useCallback(async (pageToLoad) => {
    setLoading(true)
    try {
      const requestParams = {
        page: pageToLoad,
        limit: LIMIT,
      }
      if (search.trim()) requestParams.search = search.trim()
      if (cat !== 'all' && cat !== 'micro') requestParams.category = cat

      const res = await api.get('/products', {
        params: requestParams,
        timeout: 8000,
      })

      if (res.data?.success) {
        const list = res.data.data || res.data.products || []
        setApiProducts(list)
        setTotalPages(res.data.totalPages || 1)
        setTotalCount(res.data.total || list.length)
        setApiReady(true)
      }
    } catch {
      // API mavjud bo'lmasa, local PRODUCTS dan foydalanamiz (silent fallback)
      setApiReady(false)
    } finally {
      setLoading(false)
    }
  }, [search, cat])

  useEffect(() => {
    fetchFromAPI(page)
  }, [fetchFromAPI, page])

  useEffect(() => {
    api.get('/categories')
      .then(res => {
        const cats = Array.isArray(res.data) ? res.data : (res.data?.data || [])
        setDbCategories(cats.filter(c => c.status === 'active'))
      })
      .catch(() => {})
  }, [])

  const allCategories = (() => {
    const staticNames = CATEGORIES.map(c => c.name)
    const extraDb = dbCategories
      .filter(c => !staticNames.includes(c.name))
      .map(c => ({ id: c.id, name: c.name, icon: 'Package', sub: [] }))
    return [...CATEGORIES, ...extraDb]
  })()

  // API tayyor bo'lsa API ma'lumotlarini, aks holda local ma'lumotlarni ishlatamiz
  const sourceProducts = apiProducts

  let filtered = sourceProducts
  let usingLocalFallback = false

  if (cat === 'micro') {
    // 'micro' kategoriyasi backendda yo'q — joriy sahifa ichida filtrlaymiz
    filtered = sourceProducts.filter((p) => MCU_CATEGORIES.includes(p.cat))
  }

  if (sort === 'price_asc') filtered = [...filtered].sort((a, b) => a.price - b.price)
  if (sort === 'price_desc') filtered = [...filtered].sort((a, b) => b.price - a.price)
  if (sort === 'rating') filtered = [...filtered].sort((a, b) => b.rating - a.rating)

  const displayTotal = totalCount
  const showPagination = totalPages > 1

  const SidebarContent = ({ onSelect }) => (
    <div className="space-y-1">
      {/* All button */}
      <motion.button
        type="button"
        onClick={() => { setCat('all'); onSelect?.() }}
        whileHover={{ x: 3 }}
        whileTap={{ scale: 0.97 }}
        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2.5 ${
          cat === 'all'
            ? 'bg-gradient-to-r from-primary to-teal text-white shadow-lg shadow-primary/20'
            : 'text-white/60 hover:text-white hover:bg-white/8'
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cat === 'all' ? 'bg-white' : 'bg-white/20'}`} />
        {t('products_page.all')}
      </motion.button>

      {/* Divider */}
      <div className="pt-1 pb-1">
        <div className="h-px bg-white/8" />
      </div>

      {allCategories.map((c, i) => {
        const active = cat === c.name
        return (
          <motion.button
            key={c.id}
            type="button"
            onClick={() => { setCat(c.name); onSelect?.() }}
            whileHover={{ x: 3 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.025 }}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2.5 group ${
              active
                ? 'bg-gradient-to-r from-primary/80 to-teal/80 text-white shadow-md shadow-primary/15'
                : 'text-white/60 hover:text-white hover:bg-white/8'
            }`}
          >
            <span className={`flex-shrink-0 transition-all ${active ? 'text-white' : 'text-teal group-hover:text-white'}`}>
              <CategoryIcon name={c.icon} size={15} />
            </span>
            <span className="truncate">{categoryLabel(t, c)}</span>
            {active && (
              <motion.span
                layoutId="active-dot"
                className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80"
              />
            )}
          </motion.button>
        )
      })}
    </div>
  )

  const currentCatObj = allCategories.find((c) => c.name === cat)
  const pageTitle = cat === 'micro'
    ? t('popular.title')
    : cat !== 'all'
    ? categoryLabel(t, currentCatObj || { name: cat })
    : t('nav.products')

  const goToPage = (p) => {
    if (p < 1 || p > totalPages || p === page) return
    setPage(p)
    window.scrollTo(0, 0)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 pt-32 md:pt-36 pb-16">
      <motion.h1
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-white font-display font-bold text-3xl md:text-4xl mb-8"
      >
        {pageTitle}
      </motion.h1>

      <ProductFilters
        search={search}
        onSearch={setSearch}
        sort={sort}
        onSort={setSort}
        onOpenFilter={() => setMobileFilter(true)}
      />

      <div className="flex gap-6 lg:gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-52 lg:w-60 flex-shrink-0">
          <div className="sticky top-36 rounded-2xl border border-white/12 bg-white/[0.05] backdrop-blur-xl p-4 shadow-lg shadow-black/20">
            {/* Sidebar header */}
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
              <SlidersHorizontal size={14} className="text-teal" />
              <h3 className="text-white font-bold text-xs uppercase tracking-widest">{t('products_page.categories')}</h3>
            </div>
            <SidebarContent />

            {/* Category count badge */}
            <div className="mt-4 pt-3 border-t border-white/8 text-center">
              <span className="text-white/30 text-xs">{displayTotal} {t('products_page.found', { count: '' }).replace(/\d+\s*/, '').trim() || 'ta mahsulot'}</span>
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <p className="text-white/50 text-sm mb-5">{t('products_page.found', { count: displayTotal })}</p>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
              {Array(6).fill(0).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
                {filtered.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
              {filtered.length === 0 && (
                <div className="text-center py-20 text-white/40">
                  <p className="text-lg">{t('products_page.empty')}</p>
                </div>
              )}
            </>
          )}

          {/* Pagination */}
          {showPagination && (
            <div className="flex items-center justify-center flex-wrap gap-2 mt-10 pb-6">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl border border-white/10 text-white/60
                           hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed
                           transition-all text-sm"
              >
                ← {t('common.prev', 'Oldingi')}
              </button>

              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum
                if (totalPages <= 7) {
                  pageNum = i + 1
                } else if (page <= 4) {
                  pageNum = i + 1
                } else if (page >= totalPages - 3) {
                  pageNum = totalPages - 6 + i
                } else {
                  pageNum = page - 3 + i
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all
                      ${page === pageNum
                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                        : 'border border-white/10 text-white/50 hover:bg-white/10'
                      }`}
                  >
                    {pageNum}
                  </button>
                )
              })}

              <button
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-xl border border-white/10 text-white/60
                           hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed
                           transition-all text-sm"
              >
                {t('common.next', 'Keyingi')} →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {mobileFilter && (
          <div className="fixed inset-0 z-[80] md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
              onClick={() => setMobileFilter(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="absolute right-0 top-0 bottom-0 w-[min(300px,88vw)] bg-[#0a0e17] border-l border-white/15 p-6 pt-10 overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={14} className="text-teal" />
                  <h3 className="text-white font-bold text-sm uppercase tracking-wider">{t('products_page.categories')}</h3>
                </div>
                <button
                  onClick={() => setMobileFilter(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/8 text-white/60 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <SidebarContent onSelect={() => setMobileFilter(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}