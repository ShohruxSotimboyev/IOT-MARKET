import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { Save, Sun, Moon, Globe, Shield, Bell, Key } from 'lucide-react'
import toast from 'react-hot-toast'
import client from '../../api/client'

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
  const [profile, setProfile] = useState({ username: user?.username || 'Admin', email: user?.email || '', phone: user?.phone || '' })
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [changingPassword, setChangingPassword] = useState(false)

  const tabs = [
    { key: 'general', label: t('settings.general'), icon: Globe },
    { key: 'account', label: t('settings.account'), icon: Shield },
    { key: 'password', label: t('settings.password'), icon: Key },
    { key: 'notifications', label: t('settings.notifications'), icon: Bell },
  ]

  const handleSave = () => toast.success(t('settings.saved'))

  const handleChangePassword = async () => {
    if (!passwords.currentPassword || !passwords.newPassword) {
      return toast.error(t('settings.passwordRequired'))
    }
    if (passwords.newPassword.length < 8) {
      return toast.error(t('settings.passwordMinLength'))
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error(t('settings.passwordMismatch'))
    }
    setChangingPassword(true)
    try {
      await client.put('/auth/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      })
      toast.success(t('settings.passwordChanged'))
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.errorOccurred'))
    }
    setChangingPassword(false)
  }

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
            <div className="ui-card-header"><span className="ui-card-title">{t('settings.interfaceTitle')}</span></div>
            <div className="ui-card-body">
              <div className="toggle-wrap">
                <div className="toggle-info">
                  <div className="toggle-title">{theme === 'dark' ? t('settings.darkMode') : t('settings.lightMode')}</div>
                  <div className="toggle-desc">{t('settings.themeDesc')}</div>
                </div>
                <button className={`toggle${theme === 'dark' ? ' on' : ''}`} onClick={toggleTheme} />
              </div>
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
                  <label className="ui-label">{t('settings.name')}</label>
                  <input className="ui-input" value={profile.username} onChange={e => setProfile(p => ({ ...p, username: e.target.value }))} />
                </div>
                <div className="ui-input-wrap">
                  <label className="ui-label">{t('settings.email')}</label>
                  <input className="ui-input" type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div className="ui-input-wrap">
                  <label className="ui-label">{t('settings.phone')}</label>
                  <input className="ui-input" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+998 90 123 45 67" />
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'password' && (
          <div className="ui-card">
            <div className="ui-card-header"><span className="ui-card-title">{t('settings.changePassword')}</span></div>
            <div className="ui-card-body">
              <div className="form-grid" style={{ maxWidth: 480 }}>
                <div className="ui-input-wrap">
                  <label className="ui-label">{t('settings.currentPassword')}</label>
                  <input className="ui-input" type="password" placeholder="••••••••"
                    value={passwords.currentPassword}
                    onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))} />
                </div>
                <div className="ui-input-wrap">
                  <label className="ui-label">{t('settings.newPassword')}</label>
                  <input className="ui-input" type="password" placeholder="Kamida 8 ta belgi"
                    value={passwords.newPassword}
                    onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))} />
                </div>
                <div className="ui-input-wrap">
                  <label className="ui-label">{t('settings.confirmPassword')}</label>
                  <input className="ui-input" type="password" placeholder="••••••••"
                    value={passwords.confirmPassword}
                    onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))} />
                </div>
                <div>
                  <button className="btn btn-primary" onClick={handleChangePassword} disabled={changingPassword}>
                    <Key size={15} /> {changingPassword ? t('settings.changing') : t('settings.changeBtn')}
                  </button>
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
                { key: 'orders', title: t('settings.newOrders'), desc: t('settings.newOrdersDesc') },
                { key: 'messages', title: t('settings.newMessages'), desc: t('settings.newMessagesDesc') },
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
