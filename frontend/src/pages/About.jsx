import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  Wifi, Users, Award, Globe, ArrowRight, Truck, Shield, Headphones, Zap,
} from 'lucide-react'
import { STORE } from '../data/store'

export default function About() {
  const { t } = useTranslation()

  const stats = [
    { value: '120+', label: t('about.stat_products'), icon: Wifi },
    { value: '150+', label: t('about.stat_brands'), icon: Award },
    { value: '20K+', label: t('about.stat_clients'), icon: Users },
    { value: '6+', label: t('about.stat_years'), icon: Globe },
  ]

  const values = [
    { icon: Shield, title: t('about.value_quality_title'), desc: t('about.value_quality_desc') },
    { icon: Truck, title: t('about.value_delivery_title'), desc: t('about.value_delivery_desc') },
    { icon: Headphones, title: t('about.value_support_title'), desc: t('about.value_support_desc') },
    { icon: Zap, title: t('about.value_innovation_title'), desc: t('about.value_innovation_desc') },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 pt-32 md:pt-36 pb-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
        <h1 className="text-white font-display font-bold text-4xl md:text-5xl mb-4">{t('nav.about')}</h1>
        <p className="text-white/55 text-lg max-w-2xl mx-auto leading-relaxed">{t('about.intro')}</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="rounded-[15px] border border-white/12 bg-white/[0.06] p-6 text-center hover:border-white/20 transition-colors"
          >
            <s.icon className="w-8 h-8 text-teal mx-auto mb-3" />
            <p className="text-3xl font-display font-bold text-white mb-1">{s.value}</p>
            <p className="text-white/45 text-sm">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-[15px] border border-white/12 bg-white/[0.06] p-8 md:p-12 mb-8"
      >
        <h2 className="text-white font-display font-bold text-2xl mb-4">{t('about.mission_title')}</h2>
        <p className="text-white/60 leading-relaxed mb-4">{t('about.mission_desc')}</p>
        <p className="text-white/55 leading-relaxed">{t('about.story')}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-[15px] border border-white/12 bg-white/[0.06] p-8 md:p-10 mb-10"
      >
        <h2 className="text-white font-display font-bold text-2xl mb-6">{t('about.values_title')}</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {values.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className="flex gap-4">
              <div className="w-11 h-11 rounded-xl bg-teal/15 flex items-center justify-center shrink-0">
                <Icon size={22} className="text-teal" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-[15px] border border-white/12 bg-gradient-to-br from-primary/15 to-teal/10 p-8 md:p-10 mb-10"
      >
        <h2 className="text-white font-display font-bold text-xl mb-3">{t('about.location_title')}</h2>
        <p className="text-white/60 text-sm leading-relaxed mb-2">{t('about.location_desc')}</p>
        <p className="text-white/70 text-sm">📍 {STORE.address}</p>
        <p className="text-white/50 text-sm mt-2">{STORE.region}, {STORE.city}</p>
      </motion.div>

      <div className="text-center">
        <Link
          to="/contact"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-gray-900 font-bold rounded-full hover:shadow-xl transition-all hover:-translate-y-0.5"
        >
          {t('contact.cta')}
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  )
}
