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

export function FormSelect({ label, icon: Icon, children, className = '', ...props }) {
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
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35 group-focus-within:text-teal transition-colors pointer-events-none z-10"
          />
        )}
        <select
          {...props}
          className={`w-full h-12 appearance-none bg-white/[0.06] border border-white/12 rounded-xl text-white text-sm outline-none cursor-pointer transition-all duration-200 focus:border-teal/45 focus:shadow-[0_0_0_3px_rgba(0,175,163,0.12)] ${Icon ? 'pl-11 pr-10' : 'px-4 pr-10'}`}
        >
          {children}
        </select>
        <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40 text-xs">▼</span>
      </div>
    </div>
  )
}
