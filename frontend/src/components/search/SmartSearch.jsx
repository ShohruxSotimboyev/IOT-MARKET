import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, X, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { searchProducts } from '../../utils/search'
import { usePersistedState } from '../../hooks/usePersistedState'
import api from '../../api/axios'

export default function SmartSearch({ className = '', navHidden = false }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [query, setQuery] = usePersistedState('iot_search_nav_draft', '')
  const [focused, setFocused] = useState(false)
  const [active, setActive] = useState(0)
  const ref = useRef(null)
  const inputRef = useRef(null)

  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  
  // MUHIM O'ZGARISH: Agar navbar yashirilgan bo'lsa, panelni ham yashiramiz
  const showPanel = focused && query.trim().length > 0 && !navHidden

  useEffect(() => {
    if (query.trim() === '') {
      setResults([])
      return
    }

    setLoading(true)
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await api.get(`/products/search?q=${encodeURIComponent(query)}`)
        if (res.data?.success) {
          setResults(res.data.data)
        }
      } catch (error) {
        console.error('Qidiruvda xatolik:', error)
      } finally {
        setLoading(false)
      }
    }, 400)

    return () => clearTimeout(delayDebounceFn)
  }, [query])

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setFocused(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const go = useCallback((q = query) => {
    const trimmed = q.trim()
    if (!trimmed) return
    navigate(`/products?search=${encodeURIComponent(trimmed)}`)
    setFocused(false)
    setQuery('')
  }, [navigate, query, setQuery])

  const pick = (product) => {
    navigate(`/product/${product.id}`)
    setFocused(false)
    setQuery('')
  }

  const onKeyDown = (e) => {
    if (!showPanel || !results.length) {
      if (e.key === 'Enter') go()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => (a + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => (a - 1 + results.length) % results.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      pick(results[active])
    } else if (e.key === 'Escape') {
      setFocused(false)
      inputRef.current?.blur()
    }
  }

  return (
    <div ref={ref} className={`relative z-[60] ${className}`}>
      <style>{`
        input::-webkit-search-cancel-button {
          display: none !important;
          -webkit-appearance: none;
        }
      `}</style>

      {/* Backdrop (Backdrop butunlay o'chirildi) */}

      <div className="relative group">
        <Search
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35 group-focus-within:text-teal transition-colors duration-300 pointer-events-none"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setFocused(true)
            setActive(0)
          }}
          onFocus={() => setFocused(true)}
          onKeyDown={onKeyDown}
          placeholder={t('nav.search')}
          className="w-full h-11 pl-11 pr-10 rounded-2xl bg-white/[0.07] border border-white/12 text-white text-sm placeholder-white/30 outline-none transition-all duration-300 focus:bg-white/10 focus:border-teal/40"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); inputRef.current?.focus() }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-0.5 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            key="search-panel"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-white/15 bg-[#0a0e17] shadow-2xl overflow-hidden z-[70]"
          >
            {results.length > 0 ? (
              <ul className="max-h-72 overflow-y-auto py-2">
                {results.map((p, i) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onMouseEnter={() => setActive(i)}
                      onClick={() => pick(p)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                        active === i ? 'bg-white/10' : 'hover:bg-white/5'
                      }`}
                    >
                      <img src={p.img} alt="" className="w-11 h-11 rounded-lg object-cover border border-white/10" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{p.name}</p>
                        <p className="text-white/40 text-xs">{p.cat} · {p.price.toLocaleString()} {t('common.currency')}</p>
                      </div>
                      <ArrowRight size={14} className="text-white/30" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : loading ? (
              <p className="px-4 py-6 text-white/45 text-sm text-center">Yuklanmoqda...</p>
            ) : (
              <p className="px-4 py-6 text-white/45 text-sm text-center">{t('search.no_results')}</p>
            )}
            <button
              type="button"
              onClick={() => go()}
              className="w-full px-4 py-3 text-sm font-semibold text-teal border-t border-white/10 hover:bg-white/5 transition-colors"
            >
              {t('search.show_all')} «{query}»
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}