import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'
import { motion } from 'framer-motion'

const languages = [
  { code: 'uz', name: 'O\'zbek', flag: '🇺🇿' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' }
]

const LanguageSelector = () => {
  const { i18n } = useTranslation()

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
  }

  return (
    <div className="language-selector">
      <motion.button
        className="lang-btn"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Globe size={18} />
        <span>{languages.find(lang => lang.code === i18n.language)?.flag || '🇺🇿'}</span>
      </motion.button>
      <div className="lang-dropdown">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`lang-option ${i18n.language === lang.code ? 'active' : ''}`}
          >
            <span>{lang.flag}</span>
            <span>{lang.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default LanguageSelector
