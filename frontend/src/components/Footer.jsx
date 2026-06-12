import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail } from 'lucide-react'
import { STORE } from '../data/store'
import { useTheme } from '../context/ThemeContext'

export default function Footer() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const isLight = theme === 'light'

  return (
    <footer className={`mt-16 border-t ${isLight ? 'border-slate-200 bg-slate-900' : 'border-white/10 bg-black/50 backdrop-blur-xl'}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-teal flex items-center justify-center text-white font-display font-bold text-sm shadow-lg">
                IoT
              </div>
              <div>
                <div className="text-white font-display font-semibold">{t('brand.title')}</div>
                <div className="text-white/40 text-xs">{t('brand.tagline')}</div>
              </div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">
              {STORE.region}, {STORE.city} — {t('footer.region_desc')}.
            </p>
          </div>

          {/* Info links */}
          <div>
            <h4 className="text-white/80 font-semibold mb-4 text-xs uppercase tracking-wider">{t('footer.info')}</h4>
            <div className="space-y-2.5">
              {[['/', t('nav.home')], ['/products', t('nav.products')], ['/about', t('nav.about')], ['/contact', t('nav.contact')]].map(([to, l]) => (
                <Link key={to} to={to} className="block text-white/50 text-sm hover:text-white transition-colors">
                  {l}
                </Link>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white/80 font-semibold mb-4 text-xs uppercase tracking-wider">{t('footer.cats')}</h4>
            <div className="space-y-2.5">
              {['Arduino', 'Raspberry Pi', 'ESP Modullar', 'Sensorlar', 'Smart Home'].map((c) => (
                <Link key={c} to={`/products?cat=${encodeURIComponent(c)}`} className="block text-white/50 text-sm hover:text-white transition-colors">
                  {c}
                </Link>
              ))}
            </div>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="text-white/80 font-semibold mb-4 text-xs uppercase tracking-wider">{t('footer.contacts')}</h4>
            <div className="space-y-3 text-white/50 text-sm">
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-teal shrink-0 mt-0.5" />
                <span>{t('footer.address')}</span>
              </div>
              <a href={`tel:${STORE.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone size={14} className="text-teal shrink-0" />
                {t('footer.phone')}
              </a>
              <a href={`mailto:${STORE.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail size={14} className="text-teal shrink-0" />
                {STORE.email}
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">© {new Date().getFullYear()} IoT Market. {t('footer.rights')}.</p>
          <div className="flex gap-3">
            {['Telegram', 'Instagram', 'YouTube'].map((s) => (
              <motion.a
                key={s}
                href="#"
                whileHover={{ scale: 1.08, y: -2 }}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 border border-white/15 text-white/60 hover:text-white hover:border-white/30 text-xs font-bold transition-colors"
              >
                {s[0]}
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}