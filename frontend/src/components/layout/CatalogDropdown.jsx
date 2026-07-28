import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Zap } from 'lucide-react'
import { CATEGORIES } from '../../data'
import CategoryIcon from '../common/CategoryIcon'
import { categoryLabel } from '../../i18n/helpers'
import { useRef, useCallback } from 'react'

const CAT_COLORS = {
  1: { from: '#f59e0b', to: '#ef4444', bg: 'rgba(245,158,11,0.08)', bgHover: 'rgba(245,158,11,0.14)' },
  2: { from: '#3b82f6', to: '#06b6d4', bg: 'rgba(59,130,246,0.08)', bgHover: 'rgba(59,130,246,0.14)' },
  3: { from: '#8b5cf6', to: '#ec4899', bg: 'rgba(139,92,246,0.08)', bgHover: 'rgba(139,92,246,0.14)' },
  4: { from: '#10b981', to: '#06b6d4', bg: 'rgba(16,185,129,0.08)', bgHover: 'rgba(16,185,129,0.14)' },
  5: { from: '#f97316', to: '#ef4444', bg: 'rgba(249,115,22,0.08)', bgHover: 'rgba(249,115,22,0.14)' },
  6: { from: '#6366f1', to: '#8b5cf6', bg: 'rgba(99,102,241,0.08)', bgHover: 'rgba(99,102,241,0.14)' },
}

export default function CatalogDropdown({
  open, onClose, anchorRect,
  activeL1, activeL2, setActiveL1, setActiveL2,
  onPanelEnter, onPanelLeave,
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const activeCat = CATEGORIES.find((c) => c.id === activeL1)
  const activeSub = activeCat?.sub.find((s) => s.id === activeL2)
  const colors = CAT_COLORS[activeL1] || { from: '#2563eb', to: '#0891b2', bg: 'rgba(37,99,235,0.08)', bgHover: 'rgba(37,99,235,0.14)' }
  const catItemRefs = useRef({})

  const handleCatHover = useCallback((cat) => {
    setActiveL1(cat.id)
    setActiveL2(null)
  }, [setActiveL1, setActiveL2])

  const top = anchorRect ? anchorRect.bottom + 8 : 112
  const left = anchorRect ? anchorRect.left : 16

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && anchorRect && (
        <>
          {/* Hover bridge */}
          <div
            className="fixed z-[205]"
            style={{ top: anchorRect.bottom, left: anchorRect.left, width: Math.max(anchorRect.width, 120), height: 14 }}
            onMouseEnter={onPanelEnter}
            onMouseLeave={onPanelLeave}
            aria-hidden
          />
          <motion.div
            key="catalog-panel"
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className="catalog-mega-menu fixed z-[210] overflow-hidden origin-top-left"
            style={{ top, left, maxWidth: 'calc(100vw - 24px)' }}
            onMouseEnter={onPanelEnter}
            onMouseLeave={onPanelLeave}
          >
            <div className="catalog-mega-inner">
              {/* Left: Categories */}
              <div className="catalog-col-left">
                <div className="catalog-section-title">
                  <Zap size={10} />
                  <span>{t('cats.title')}</span>
                </div>

                {CATEGORIES.map((cat) => {
                  const isActive = activeL1 === cat.id
                  const c = CAT_COLORS[cat.id] || { from: '#2563eb', to: '#0891b2', bg: 'rgba(37,99,235,0.08)' }
                  return (
                    <div
                      key={cat.id}
                      ref={el => catItemRefs.current[cat.id] = el}
                      onMouseEnter={() => handleCatHover(cat)}
                      onClick={() => { onClose(); navigate(`/products?cat=${encodeURIComponent(cat.name)}`) }}
                      className={`catalog-cat-item ${isActive ? 'active' : ''}`}
                      style={isActive ? {
                        '--cat-from': c.from,
                        '--cat-bg': c.bg,
                        '--cat-bg-hover': c.bgHover,
                      } : undefined}
                    >
                      <span className="catalog-cat-icon" style={isActive ? { background: c.bg, color: c.from } : undefined}>
                        <CategoryIcon name={cat.icon} size={18} />
                      </span>
                      <span className="catalog-cat-name">{categoryLabel(t, cat)}</span>
                      {cat.sub?.length > 0 && (
                        <ChevronRight size={14} className="catalog-cat-chevron" />
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Right: Subcategories */}
              <AnimatePresence mode="wait">
                {activeL1 && activeCat?.sub?.length > 0 && (
                  <motion.div
                    key={`sub-${activeL1}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10, transition: { duration: 0.1 } }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="catalog-col-right"
                  >
                    <div className="catalog-sub-header">
                      <span className="catalog-sub-icon" style={{ background: colors.bg, color: colors.from }}>
                        <CategoryIcon name={activeCat.icon} size={16} />
                      </span>
                      <span className="catalog-sub-title" style={{ color: colors.from }}>
                        {categoryLabel(t, activeCat)}
                      </span>
                    </div>

                    <div className="catalog-grid">
                      {activeCat.sub.map((s, i) => (
                        <motion.div
                          key={s.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 + 0.05, duration: 0.2 }}
                          className="catalog-grid-group"
                        >
                          <h4 
                            className="catalog-group-title" 
                            onClick={() => { onClose(); navigate(`/products?cat=${encodeURIComponent(activeCat.name)}`) }}
                          >
                            {s.name}
                          </h4>
                          {s.items?.length > 0 && (
                            <div className="catalog-group-items">
                              {s.items.map((item) => (
                                <button
                                  key={item}
                                  type="button"
                                  onClick={() => { onClose(); navigate(`/products?cat=${encodeURIComponent(activeCat.name)}`) }}
                                  className="catalog-group-item"
                                >
                                  {item}
                                </button>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
