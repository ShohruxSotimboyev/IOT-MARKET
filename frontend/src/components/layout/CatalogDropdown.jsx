import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Zap } from 'lucide-react'
import { CATEGORIES } from '../../data'
import CategoryIcon from '../common/CategoryIcon'
import { categoryLabel } from '../../i18n/helpers'

// Har bir kategoriya uchun rang
const CAT_COLORS = {
  1: { from: '#f59e0b', to: '#ef4444', shadow: 'rgba(245,158,11,0.4)' }, // Arduino - orange
  2: { from: '#3b82f6', to: '#06b6d4', shadow: 'rgba(59,130,246,0.4)' }, // ESP - blue
  3: { from: '#8b5cf6', to: '#ec4899', shadow: 'rgba(139,92,246,0.4)' }, // Raspberry - purple
  4: { from: '#10b981', to: '#06b6d4', shadow: 'rgba(16,185,129,0.4)' }, // Sensors - green
  5: { from: '#f97316', to: '#ef4444', shadow: 'rgba(249,115,22,0.4)' }, // Motors - orange-red
  6: { from: '#6366f1', to: '#8b5cf6', shadow: 'rgba(99,102,241,0.4)' }, // Tools - indigo
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
  const colors = CAT_COLORS[activeL1] || { from: '#00afa3', to: '#0a74da', shadow: 'rgba(0,175,163,0.4)' }

  const top = anchorRect ? anchorRect.bottom + 12 : 112
  const left = anchorRect ? anchorRect.left : 16

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && anchorRect && (
        <>
          {/* Hover bridge */}
          <div
            className="fixed z-[205]"
            style={{ top: anchorRect.bottom, left: anchorRect.left, width: Math.max(anchorRect.width, 120), height: 20 }}
            onMouseEnter={onPanelEnter}
            onMouseLeave={onPanelLeave}
            aria-hidden
          />
          <motion.div
            key="catalog-panel"
            initial={{ opacity: 0, y: 18, scale: 0.94, rotateX: 8 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, y: 10, scale: 0.96, rotateX: 4 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="fixed z-[210] flex max-h-[min(70vh,560px)] rounded-3xl border border-white/10 bg-black/40 backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] overflow-hidden isolate origin-top-left"
            style={{ top, left, maxWidth: 'calc(100vw - 24px)', perspective: 1200 }}
            onMouseEnter={onPanelEnter}
            onMouseLeave={onPanelLeave}
          >
            {/* L1 Categories */}
            <div className="py-3 w-[min(280px,85vw)] border-r border-white/5 overflow-y-auto bg-black/30 custom-scrollbar">
              <div className="px-5 pb-3 flex items-center gap-2">
                <Zap size={11} className="text-cyan-400" />
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400/80 dark-only-cyan">
                  {t('cats.title')}
                </p>
              </div>
              {CATEGORIES.map((cat) => {
                const isActive = activeL1 === cat.id
                const c = CAT_COLORS[cat.id] || { from: '#00afa3', to: '#0a74da' }
                return (
                  <motion.div
                    key={cat.id}
                    onMouseEnter={() => { setActiveL1(cat.id); setActiveL2(null) }}
                    whileHover={{ x: 3 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className={`group relative flex items-center justify-between mx-2 mb-0.5 px-3 py-2.5 rounded-2xl cursor-pointer transition-all duration-200 ${
                      isActive
                        ? 'text-white cat-text-active'
                        : 'text-white/75 cat-text-inactive hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {isActive && (
                      <>
                        <motion.div
                          layoutId="activeCatBg"
                          className="absolute inset-0 rounded-2xl"
                          style={{ background: `linear-gradient(135deg, ${c.from}22, ${c.to}11)`, borderWidth: 1, borderStyle: 'solid', borderColor: `${c.from}33` }}
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                        <motion.div
                          layoutId="activeCatBar"
                          className="absolute left-0 top-1/4 bottom-1/4 w-[3px] rounded-r-full"
                          style={{ background: `linear-gradient(to bottom, ${c.from}, ${c.to})`, boxShadow: `0 0 10px ${c.from}` }}
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      </>
                    )}
                    <span className="relative flex items-center gap-3 min-w-0 pl-1">
                      <motion.span
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300"
                        style={isActive ? {
                          background: `linear-gradient(135deg, ${c.from}33, ${c.to}22)`,
                          boxShadow: `0 0 12px ${c.shadow || c.from + '40'}`,
                        } : {}}
                        whileHover={!isActive ? { scale: 1.1 } : {}}
                      >
                        <CategoryIcon
                          name={cat.icon}
                          size={18}
                          style={isActive ? { color: c.from } : {}}
                          className={isActive ? '' : 'text-white/60 group-hover:text-white/90'}
                        />
                      </motion.span>
                      <span className="text-[14px] font-semibold leading-tight">
                        {categoryLabel(t, cat)}
                      </span>
                    </span>
                    <ChevronRight
                      size={16}
                      className="relative shrink-0 transition-all duration-300"
                      style={isActive ? { color: c.from, transform: 'translateX(2px)' } : {}}
                    />
                  </motion.div>
                )
              })}
            </div>

            {/* L2 Subcategories */}
            <AnimatePresence mode="wait">
              {activeL1 && (
                <motion.div
                  key={`l2-${activeL1}`}
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12, transition: { duration: 0.12 } }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="py-3 w-[min(240px,80vw)] border-r border-white/5 overflow-y-auto bg-black/40 custom-scrollbar"
                >
                  <p className="px-5 pb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white/35">
                    {t('cats.subcategories')}
                  </p>
                  {activeCat?.sub.map((s) => {
                    const isActive = activeL2 === s.id
                    return (
                      <motion.div
                        key={s.id}
                        onMouseEnter={() => setActiveL2(s.id)}
                        whileHover={{ x: 2 }}
                        className={`mx-2 mb-0.5 px-4 py-2.5 rounded-xl cursor-pointer text-[13px] font-medium flex items-center justify-between transition-all duration-150 ${
                          isActive
                            ? 'bg-white/10 text-white shadow-inner'
                            : 'text-white/55 hover:text-white/85 hover:bg-white/5'
                        }`}
                      >
                        <span className="truncate pr-2">{s.name}</span>
                        <motion.span
                          animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : -4 }}
                          transition={{ duration: 0.15 }}
                        >
                          <ChevronRight size={13} className="text-white/60 shrink-0" />
                        </motion.span>
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            {/* L3 Items */}
            <AnimatePresence mode="wait">
              {activeL2 && (
                <motion.div
                  key={`l3-${activeL2}`}
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12, transition: { duration: 0.12 } }}
                  transition={{ duration: 0.22, ease: 'easeOut', delay: 0.04 }}
                  className="py-3 w-[min(230px,75vw)] overflow-y-auto bg-black/55 custom-scrollbar"
                >
                  <p className="px-5 pb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white/35">
                    {t('cats.items')}
                  </p>
                  {activeSub?.items.map((item, i) => (
                    <motion.button
                      key={item}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 + 0.08, duration: 0.18 }}
                      whileHover={{ x: 4, color: colors.from }}
                      type="button"
                      onClick={() => { onClose(); navigate(`/products?cat=${encodeURIComponent(activeCat.name)}`) }}
                      className="block w-[calc(100%-16px)] mx-2 mb-0.5 text-left px-4 py-2 rounded-xl text-[13px] font-medium text-white/55 hover:bg-white/8 transition-all duration-200"
                    >
                      {item}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}