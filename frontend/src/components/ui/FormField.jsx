import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function FormInput({ label, icon: Icon, className = '', ...props }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-white/55 text-xs font-semibold uppercase tracking-wider mb-2">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <Icon
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35 group-focus-within:text-teal transition-colors pointer-events-none"
          />
        )}
        <input
          {...props}
          className={`w-full h-12 bg-white/[0.06] border border-white/12 rounded-xl text-white text-sm placeholder-white/30 outline-none transition-all duration-200 focus:bg-white/[0.09] focus:border-teal/45 focus:shadow-[0_0_0_3px_rgba(0,175,163,0.12)] ${Icon ? 'pl-11 pr-4' : 'px-4'}`}
        />
      </div>
    </div>
  )
}

export function FormTextarea({ label, className = '', rows = 4, ...props }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-white/55 text-xs font-semibold uppercase tracking-wider mb-2">
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        {...props}
        className="w-full bg-white/[0.06] border border-white/12 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 outline-none transition-all duration-200 focus:bg-white/[0.09] focus:border-teal/45 focus:shadow-[0_0_0_3px_rgba(0,175,163,0.12)] resize-none"
      />
    </div>
  )
}

export function FormSelect({ label, icon: Icon, options = [], value, onChange, className = '', ...props }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const selectedOption = options.find(o => o.value === value) || options[0]

  return (
    <div className={className} ref={ref}>
      {label && (
        <label className="block text-white/55 text-xs font-semibold uppercase tracking-wider mb-2">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <Icon
            size={18}
            className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none z-10 ${open ? 'text-teal' : 'text-white/35 group-hover:text-white/60'}`}
          />
        )}
        <div 
          onClick={() => setOpen(!open)}
          className={`w-full h-12 flex items-center justify-between bg-white/[0.06] border border-white/12 rounded-xl text-white text-sm outline-none cursor-pointer transition-all duration-200 hover:bg-white/[0.09] hover:border-white/20 ${open ? 'border-teal/45 bg-white/[0.09]' : ''} ${Icon ? 'pl-11 pr-4' : 'px-4'}`}
        >
          <span className="truncate">{selectedOption?.label}</span>
          <ChevronDown size={14} className={`text-white/40 transition-transform duration-200 shrink-0 ${open ? 'rotate-180 text-white' : ''}`} />
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 mt-2 w-full min-w-[200px] p-2 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl shadow-black/80"
            >
              <div className="flex flex-col gap-1">
                {options.map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => { onChange({ target: { value: opt.value } }); setOpen(false) }}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-sm transition-all ${
                      value === opt.value ? 'bg-primary/20 text-primary font-medium' : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {opt.label}
                    {value === opt.value && <Check size={14} className="shrink-0" />}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
