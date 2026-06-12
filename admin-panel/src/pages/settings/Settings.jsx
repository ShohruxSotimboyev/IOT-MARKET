import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { Save, Sun, Moon, Globe, Shield, Bell } from 'lucide-react'
import toast from 'react-hot-toast'

const LANGS = [
  { code: 'uz', label: "O'zbek" },
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' },
]

export default function Settings() {
  const { t, i18n } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuth()
  const [tab, setTab] = useState('general')
  const [notifs, setNotifs] = useState({ email: true, push: false, orders: true, messages: true })
  const [profile, setProfile] = useState({ username: user?.username || 'Admin', email: user?.email || 'admin@example.com', phone: user?.phone || '' })

  const tabs = [
    { key: 'general', label: t('settings.general'), icon: Globe },
    { key: 'account', label: t('settings.account'), icon: Shield },
    { key: 'notifications', label: t('settings.notifications'), icon: Bell },
  ]

  const handleSave = () => toast.success('Sozlamalar saqlandi')

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('settings.title')}</h1>
          <p className="page-subtitle">{t('settings.subtitle')}</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave}>
          <Save size={15} /> {t('settings.saveSettings')}
        </button>
      </div>

      <div className="settings-tabs">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} className={`settings-tab${tab === key ? ' active' : ''}`} onClick={() => setTab(key)}>
            <Icon size={14} style={{ display: 'inline', marginRight: 6 }} />{label}
          </button>
        ))}
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {tab === 'general' && (
          <div className="ui-card">
            <div className="ui-card-header"><span className="ui-card-title">Umumiy sozlamalar</span></div>
            <div className="ui-card-body">
              {/* Theme */}
              <div className="toggle-wrap">
                <div className="toggle-info">
                  <div className="toggle-title">{theme === 'dark' ? t('settings.darkMode') : t('settings.lightMode')}</div>
                  <div className="toggle-desc">Interfeys ko'rinishini o'zgartirish</div>
                </div>
                <button className={`toggle${theme === 'dark' ? ' on' : ''}`} onClick={toggleTheme} />
              </div>

              {/* Language */}
              <div style={{ marginTop: 20 }}>
                <p className="ui-label" style={{ marginBottom: 10 }}>{t('settings.language')}</p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {LANGS.map(l => (
                    <button
                      key={l.code}
                      className={`btn${i18n.language === l.code ? ' btn-primary' : ' btn-secondary'}`}
                      onClick={() => i18n.changeLanguage(l.code)}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'account' && (
          <div className="ui-card">
            <div className="ui-card-header"><span className="ui-card-title">{t('settings.profile')}</span></div>
            <div className="ui-card-body">
              <div className="form-grid" style={{ maxWidth: 480 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
                  <div className="al-avatar" style={{ width: 60, height: 60, fontSize: 22, borderRadius: 16 }}>
                    {(profile.username?.[0] || 'A').toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700 }}>{profile.username}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user?.role || 'Administrator'}</p>
                  </div>
                </div>
                <div className="ui-input-wrap">
                  <label className="ui-label">Ism</label>
                  <input className="ui-input" value={profile.username} onChange={e => setProfile(p => ({ ...p, username: e.target.value }))} />
                </div>
                <div className="ui-input-wrap">
                  <label className="ui-label">Email</label>
                  <input className="ui-input" type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div className="ui-input-wrap">
                  <label className="ui-label">Telefon</label>
                  <input className="ui-input" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+998 90 123 45 67" />
                </div>
                <div className="ui-input-wrap">
                  <label className="ui-label">Yangi parol</label>
                  <input className="ui-input" type="password" placeholder="••••••••" />
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'notifications' && (
          <div className="ui-card">
            <div className="ui-card-header"><span className="ui-card-title">{t('settings.notifications')}</span></div>
            <div className="ui-card-body">
              {[
                { key: 'email', title: t('settings.emailNotifications'), desc: 'Email orqali bildirishnomalar' },
                { key: 'push', title: t('settings.pushNotifications'), desc: 'Brauzer push-bildirishnomalari' },
                { key: 'orders', title: 'Yangi buyurtmalar', desc: 'Har yangi buyurtmada xabar' },
                { key: 'messages', title: 'Yangi xabarlar', desc: 'Foydalanuvchi xabarlari uchun' },
              ].map(n => (
                <div key={n.key} className="toggle-wrap">
                  <div className="toggle-info">
                    <div className="toggle-title">{n.title}</div>
                    <div className="toggle-desc">{n.desc}</div>
                  </div>
                  <button className={`toggle${notifs[n.key] ? ' on' : ''}`} onClick={() => setNotifs(x => ({ ...x, [n.key]: !x[n.key] }))} />
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
