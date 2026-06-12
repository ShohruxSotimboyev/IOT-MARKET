import { useEffect, useCallback, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import { useScrollLock } from '../../hooks/useScrollLock'

export default function ImageLightbox({ images = [], index = 0, onClose, onChange }) {
  const { t } = useTranslation()
  useScrollLock(true)
  const [zoom, setZoom] = useState(1)
  const [currentIdx, setCurrentIdx] = useState(index)
  const [direction, setDirection] = useState(0) // -1 = prev, 1 = next
  const touchStartX = useRef(null)

  // Agar tashqaridan index o'zgarsa, ichkaridagi state ham yangilansin
  useEffect(() => {
    setCurrentIdx(index)
    setZoom(1)
  }, [index])

  const goTo = useCallback((nextIdx) => {
    const clamped = ((nextIdx % images.length) + images.length) % images.length
    setDirection(nextIdx > currentIdx ? 1 : -1)
    setCurrentIdx(clamped)
    setZoom(1)
    // Agar tashqi onChange bor bo'lsa ham xabardor qilish
    if (typeof onChange === 'function') onChange(clamped)
  }, [currentIdx, images.length, onChange])

  const prev = useCallback((e) => {
    e?.stopPropagation()
    goTo(currentIdx - 1)
  }, [currentIdx, goTo])

  const next = useCallback((e) => {
    e?.stopPropagation()
    goTo(currentIdx + 1)
  }, [currentIdx, goTo])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
      if (e.key === 'ArrowLeft') goTo(currentIdx - 1)
      if (e.key === 'ArrowRight') goTo(currentIdx + 1)
      if (e.key === '+' || e.key === '=') setZoom((z) => Math.min(3, z + 0.25))
      if (e.key === '-') setZoom((z) => Math.max(1, z - 0.25))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, currentIdx, goTo])

  // Touch swipe support
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX }
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev()
    touchStartX.current = null
  }

  if (!images || images.length === 0) return null

  const imgSrc = images[currentIdx]

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? '60%' : '-60%', opacity: 0, scale: 0.92 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir) => ({ x: dir > 0 ? '-60%' : '60%', opacity: 0, scale: 0.92 }),
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="fixed inset-0 z-[300] flex flex-col bg-black/96 backdrop-blur-md"
      onClick={onClose}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-white/50 text-sm flex items-center gap-2 select-none">
          <Maximize2 size={15} />
          {currentIdx + 1} / {images.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setZoom((z) => Math.max(1, z - 0.25)) }}
            className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <ZoomOut size={17} />
          </button>
          <span className="text-white/60 text-xs min-w-[44px] text-center select-none">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setZoom((z) => Math.min(3, z + 0.25)) }}
            className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <ZoomIn size={17} />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClose?.() }}
            className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 text-white flex items-center justify-center hover:bg-red-500/40 transition-colors ml-1"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main image area */}
      <div
        className="flex-1 relative flex items-center justify-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Prev */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={prev}
            className="absolute left-3 md:left-6 z-20 w-12 h-12 rounded-full bg-white/12 border border-white/20 text-white flex items-center justify-center hover:bg-white/25 hover:scale-105 transition-all duration-200 backdrop-blur-sm shadow-xl select-none"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Image with animation */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIdx}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="flex items-center justify-center w-full h-full px-20"
            style={{ cursor: zoom > 1 ? 'grab' : 'zoom-in' }}
          >
            <motion.img
              src={imgSrc}
              alt={`Image ${currentIdx + 1}`}
              drag={zoom > 1}
              dragConstraints={{ left: -200, right: 200, top: -150, bottom: 150 }}
              style={{ scale: zoom }}
              className="max-w-full max-h-[72vh] object-contain select-none rounded-lg"
              draggable={false}
              onClick={(e) => {
                e.stopPropagation()
                setZoom((z) => (z >= 2 ? 1 : parseFloat((z + 0.5).toFixed(2))))
              }}
              onError={(e) => { e.target.style.opacity = '0.4' }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Next */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={next}
            className="absolute right-3 md:right-6 z-20 w-12 h-12 rounded-full bg-white/12 border border-white/20 text-white flex items-center justify-center hover:bg-white/25 hover:scale-105 transition-all duration-200 backdrop-blur-sm shadow-xl select-none"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div
          className="flex gap-2 justify-center py-3 overflow-x-auto px-4 flex-shrink-0 border-t border-white/8"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, i) => (
            <motion.button
              key={i}
              type="button"
              onClick={(e) => { e.stopPropagation(); goTo(i) }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all duration-200 ${
                i === currentIdx
                  ? 'border-teal shadow-[0_0_12px_rgba(0,175,163,0.5)] opacity-100'
                  : 'border-white/15 opacity-50 hover:opacity-80 hover:border-white/35'
              }`}
            >
              <img
                src={img}
                alt={`thumb-${i}`}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.opacity = '0' }}
              />
              {i === currentIdx && (
                <motion.div
                  layoutId="thumbActive"
                  className="absolute inset-0 ring-2 ring-teal rounded-lg"
                />
              )}
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  )
}
