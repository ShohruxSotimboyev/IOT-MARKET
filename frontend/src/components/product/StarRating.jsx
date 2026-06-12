import { Star } from 'lucide-react'

export default function StarRating({ value = 0, onChange, size = 20, readonly = false }) {
  const handleClick = (star) => {
    if (readonly || !onChange) return
    if (value === star) onChange(star - 1)
    else onChange(star)
  }

  return (
    <div
      className="flex items-center gap-0.5"
      role={readonly ? 'img' : 'group'}
      aria-label={readonly ? `Rating ${value}` : undefined}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const star = i + 1
        const filled = star <= value
        if (readonly) {
          return (
            <span key={i} className="p-0.5">
              <Star
                size={size}
                className={filled ? 'text-amber-400 fill-amber-400' : 'text-white/20'}
                strokeWidth={1.5}
              />
            </span>
          )
        }
        return (
          <button
            key={i}
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleClick(star)
            }}
            className="p-0.5 rounded hover:scale-110 active:scale-95 transition-transform"
            aria-label={`${star}`}
          >
            <Star
              size={size}
              className={filled ? 'text-amber-400 fill-amber-400' : 'text-white/25 hover:text-amber-400/60'}
              strokeWidth={1.5}
            />
          </button>
        )
      })}
    </div>
  )
}
