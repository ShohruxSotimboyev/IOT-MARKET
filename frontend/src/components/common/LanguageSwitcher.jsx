import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe } from 'lucide-react'

const LANGS = [
  { code: 'uz', label: 'UZ' },
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
]

const CLOSE_DELAY = 220

function getLangCode(i18n) {
  const raw = i18n.language || i18n.resolvedLanguage || 'uz'
  return raw.split('-')[0].toLowerCase()
}

export default function LanguageSwitcher({ compact = false, onOpenChange }) {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const [pinned, setPinned] = useState(false)
  const ref = useRef(null)
  const btnRef = useRef(null)
  const menuRef = useRef(null)
  const closeTimer = useRef(null)
  const [pos, setPos] = useState(null)
  const current = getLangCode(i18n)

  const setOpenSafe = (v) => {
    setOpen(v)
    onOpenChange?.(v)
    if (v && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setPos({ top: r.bottom + 4, right: window.innerWidth - r.right, width: r.width })
    }
    if (!v) setPinned(false)
  }

  useEffect(() => {
    if (!pinned || !open) return
    const onPointerDown = (e) => {
      const inTrigger = ref.current?.contains(e.target)
      const inMenu = menuRef.current?.contains(e.target)
      if (!inTrigger && !inMenu) setOpenSafe(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [pinned, open])

  const selectLang = (code) => {
    i18n.changeLanguage(code)
    localStorage.setItem('iot_lang', code)
    setOpenSafe(false)
  }

  const cancelClose = () => {
    clearTimeout(closeTimer.current)
  }

  const openMenu = () => {
    cancelClose()
    setOpenSafe(true)
  }

  const scheduleClose = () => {
    if (pinned) return
    cancelClose()
    closeTimer.current = setTimeout(() => setOpenSafe(false), CLOSE_DELAY)
  }

  const onButtonClick = () => {
    cancelClose()
    if (open && pinned) {
      setOpenSafe(false)
      return
    }
    setPinned(true)
    setOpenSafe(true)
  }

  return (
    <>
      <div
        ref={ref}
        className="relative"
        onMouseEnter={openMenu}
        onMouseLeave={scheduleClose}
      >
        <button
          ref={btnRef}
          type="button"
          onClick={onButtonClick}
          className={`nav-icon-btn relative flex items-center justify-center rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300 ${
            compact ? 'p-2.5' : 'px-2.5 py-2 gap-1.5'
          } ${open ? 'bg-white/10 text-white' : ''}`}
          aria-expanded={open}
          aria-label={t('nav.language', { defaultValue: 'Til' })}
        >
          <Globe size={20} strokeWidth={1.75} />
          {!compact && (
            <span className="text-xs font-bold tracking-wide hidden xl:inline">
              {LANGS.find((l) => l.code === current)?.label || 'UZ'}
            </span>
          )}
        </button>
      </div>

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {open && pos && (
              <>
                {pinned && (
                  <motion.div
                    key="lang-bg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm"
                    onClick={() => setOpenSafe(false)}
                    aria-hidden
                  />
                )}
                <div
                  className="fixed z-[205]"
                  style={{
                    top: pos.top - 14,
                    right: pos.right,
                    width: Math.max(pos.width, 120),
                    height: 18,
                  }}
                  onMouseEnter={cancelClose}
                  onMouseLeave={scheduleClose}
                  aria-hidden
                />
                <motion.div
                  ref={menuRef}
                  key="lang-menu"
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.97 }}
                  transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                  className="fixed z-[210] min-w-[110px] py-1.5 rounded-xl border border-white/20 bg-[#0a0e17]/98 backdrop-blur-xl shadow-2xl"
                  style={{ top: pos.top, right: pos.right }}
                  onMouseEnter={openMenu}
                  onMouseLeave={scheduleClose}
                >
                  {LANGS.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        selectLang(lang.code)
                      }}
                      className={`w-full px-4 py-2.5 text-left text-xs font-bold tracking-wider transition-colors duration-200 ${
                        current === lang.code
                          ? 'text-teal bg-teal/10'
                          : 'text-white/80 hover:text-white hover:bg-white/8'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  )
}
