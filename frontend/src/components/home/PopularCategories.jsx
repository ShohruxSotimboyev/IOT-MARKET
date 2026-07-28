import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { FEATURED_CATEGORIES } from '../../data/featuredCategories'
import { featuredLabel } from '../../i18n/helpers'

function CategoryCard({ cat, large, t }) {
  const height = large ? 'h-[200px] md:h-[220px]' : 'h-[160px] md:h-[180px]'
  const imgClass = large
    ? 'absolute right-0 bottom-0 h-[85%] w-auto max-w-[55%] object-contain object-bottom transition-transform duration-500 ease-out group-hover:scale-105 group-hover:-translate-y-1 drop-shadow-2xl'
    : 'absolute right-1 bottom-0 h-[70%] w-auto max-w-[50%] object-contain object-bottom transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-translate-y-2'

  return (
    <Link
      to={`/products?cat=${encodeURIComponent(cat.name)}`}
      className={`cat-card group relative block ${height} rounded-[15px] overflow-hidden transition-transform duration-500 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:shadow-black/30`}
      style={{ backgroundColor: cat.color }}
    >
      <img src={cat.image} alt={featuredLabel(t, cat, 'name')} className={imgClass} />
      <div className={`absolute inset-0 ${large ? 'bg-gradient-to-r from-black/55 via-black/25 to-transparent' : 'bg-gradient-to-t from-black/60 to-transparent'}`} />
      <div
        className={`relative z-10 h-full flex flex-col ${
          large ? 'p-6 md:p-7 justify-center max-w-[70%]' : 'p-4 justify-end'
        }`}
      >
        <span className={`text-white/80 font-semibold uppercase tracking-wider mb-2 ${large ? 'text-xs' : 'text-[10px] text-white/75'}`}>
          {t('cats.label')}
        </span>
        <h3
          className={`text-white font-display font-bold drop-shadow-md ${
            large ? 'text-xl md:text-2xl mb-2' : 'text-base md:text-lg'
          }`}
        >
          {featuredLabel(t, cat, 'name')}
        </h3>
        {large && (
          <p className="text-white/90 text-sm leading-snug line-clamp-2 drop-shadow-sm">
            {featuredLabel(t, cat, 'desc')}
          </p>
        )}
        <span className="inline-flex items-center gap-1 mt-3 text-white text-sm font-semibold translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
          {t('cats.go')} <ArrowRight size={16} className="transition-transform duration-500 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}

export default function PopularCategories() {
  const { t } = useTranslation()
  const large = FEATURED_CATEGORIES.filter((c) => c.large)
  const small = FEATURED_CATEGORIES.filter((c) => !c.large)

  return (
    <section className="py-12 md:py-16">
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-white font-display font-bold text-2xl md:text-3xl mb-8"
      >
        {t('cats.title')}
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {large.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <CategoryCard cat={cat} large t={t} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {small.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + i * 0.06 }}
          >
            <CategoryCard cat={cat} large={false} t={t} />
          </motion.div>
        ))}
      </div>
    </section>
  )
}
