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
      <style jsx>{`
        .language-selector {
          position: relative;
        }
        
        .lang-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          color: var(--text);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .lang-btn:hover {
          background: var(--bg-secondary);
          border-color: var(--border-light);
        }
        
        .lang-dropdown {
          position: absolute;
          top: calc(100% + 0.5rem);
          right: 0;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          padding: 0.5rem;
          min-width: 150px;
          display: none;
          flex-direction: column;
          gap: 0.25rem;
          z-index: 1000;
          box-shadow: var(--shadow);
        }
        
        .language-selector:hover .lang-dropdown {
          display: flex;
        }
        
        .lang-option {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: transparent;
          border: none;
          border-radius: 0.375rem;
          color: var(--text);
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }
        
        .lang-option:hover {
          background: var(--bg-tertiary);
        }
        
        .lang-option.active {
          background: var(--accent-bg);
          color: var(--primary);
        }
      `}</style>
    </div>
  )
}

export default LanguageSelector
