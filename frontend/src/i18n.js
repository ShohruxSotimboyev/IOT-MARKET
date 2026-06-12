import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import uz from './locales/uz.json'
import ru from './locales/ru.json'
import en from './locales/en.json'

const saved = typeof window !== 'undefined' ? localStorage.getItem('iot_lang') : null

i18n.use(initReactI18next).init({
  resources: { uz: { translation: uz }, ru: { translation: ru }, en: { translation: en } },
  fallbackLng: 'uz',
  lng: saved || 'uz',
  interpolation: { escapeValue: false },
})

i18n.on('languageChanged', (lng) => {
  const code = lng.split('-')[0]
  localStorage.setItem('iot_lang', code)
  document.documentElement.lang = code
})

if (typeof document !== 'undefined') {
  document.documentElement.lang = (saved || 'uz').split('-')[0]
}

export default i18n
