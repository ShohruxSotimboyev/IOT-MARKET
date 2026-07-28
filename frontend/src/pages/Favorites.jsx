import { useTranslation } from 'react-i18next'
import { useApp } from '../context/AppContext'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'

export default function Favorites() {
  const { t } = useTranslation()
  const { favs } = useApp()

  return (
    <div className="max-w-[1440px] mx-auto px-4 pt-28 pb-16">
      <h1 className="text-white font-display font-bold text-3xl mb-8">{t('fav.title')}</h1>
      {favs.length === 0 ? (
        <div className="text-center py-20 text-white/40">
          <div className="text-6xl mb-4">❤️</div>
          <p className="text-lg mb-6">{t('fav.empty')}</p>
          <Link to="/products" className="px-6 py-3 bg-gradient-to-r from-primary to-teal text-white font-bold rounded-xl">{t('nav.products')}</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {favs.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
