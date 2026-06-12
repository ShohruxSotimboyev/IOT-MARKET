import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { X, Cpu, Loader2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { usePersistedState } from '../hooks/usePersistedState'

export default function AuthModal({ mode, onClose }) {
  const { t } = useTranslation()
  const { loginRequest, setAuthUser } = useApp()
  const [m, setM] = useState(mode)
  const [email, setEmail] = usePersistedState('iot_form_auth_email', '')
  const [name, setName] = usePersistedState('iot_form_auth_name', '')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [showOtp, setShowOtp] = useState(false)
  const [otp, setOtp] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setErr(t('auth.err_required'))
      return
    }
    setLoading(true)
    setErr('')

    if (m === 'register') {
      // Register - backendga yuborish
      try {
        const res = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: name, email, phone: '+998' + Math.random().toString().slice(2, 11), password, confirmPassword: password })
        })
        const data = await res.json()
        if (!res.ok) {
          setErr(data.message || 'Xatolik yuz berdi')
          setLoading(false)
          return
        }
        setShowOtp(true)
      } catch (err) {
        setErr('Server bilan bog\'lanishda xatolik')
        setLoading(false)
      }
    } else {
      // Login - OTP yuborish
      const result = await loginRequest(email, password)
      if (result.success) {
        setShowOtp(true)
      } else {
        setErr(result.message)
      }
      setLoading(false)
    }
  }

  const verifyOtp = async (e) => {
    e.preventDefault()
    if (!otp || otp.length !== 6) {
      setErr('6 xonali kod kiritilishi shart')
      return
    }
    setLoading(true)
    setErr('')

    try {
      const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      })
      const data = await res.json()
      if (!res.ok) {
        setErr(data.message || 'Xatolik yuz berdi')
        setLoading(false)
        return
      }
      setAuthUser(data.accessToken, data.user)
      setPassword('')
      setOtp('')
      setShowOtp(false)
      onClose()
    } catch (err) {
      setErr('Server bilan bog\'lanishda xatolik')
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 16 }}
        transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        className="relative w-full max-w-md rounded-[15px] border border-white/15 bg-gray-950/90 backdrop-blur-2xl p-8 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-teal flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25">
            <Cpu size={28} className="text-white" />
          </div>
          <h2 className="text-white font-display font-bold text-2xl">
            {showOtp ? t('auth.verify_otp') : (m === 'login' ? t('auth.login_title') : t('auth.register_title'))}
          </h2>
        </div>

        {!showOtp ? (
          <form onSubmit={submit} className="space-y-4">
            {m === 'register' && (
              <div>
                <label className="text-white/55 text-xs font-medium mb-1.5 block uppercase tracking-wider">{t('auth.name')}</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/8 border border-white/12 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-teal/50 transition-colors"
                  placeholder={t('auth.name_ph')}
                />
              </div>
            )}
            <div>
              <label className="text-white/55 text-xs font-medium mb-1.5 block uppercase tracking-wider">{t('auth.email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/8 border border-white/12 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-teal/50 transition-colors"
                placeholder={t('auth.email_ph')}
              />
            </div>
            <div>
              <label className="text-white/55 text-xs font-medium mb-1.5 block uppercase tracking-wider">{t('auth.password')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/8 border border-white/12 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-teal/50 transition-colors"
                placeholder={t('auth.password_ph')}
                autoComplete={m === 'login' ? 'current-password' : 'new-password'}
              />
            </div>
            {err && <p className="text-red-400 text-sm">{err}</p>}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-primary to-teal text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : (m === 'login' ? t('auth.login') : t('auth.register'))}
            </motion.button>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="space-y-4">
            <div>
              <label className="text-white/55 text-xs font-medium mb-1.5 block uppercase tracking-wider">{t('auth.otp_code')}</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full bg-white/8 border border-white/12 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-teal/50 transition-colors text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
              />
            </div>
            <p className="text-white/45 text-sm text-center">
              Emailingizga 6 xonali kod yuborildi. Kod 90 soniya amal qiladi.
            </p>
            {err && <p className="text-red-400 text-sm">{err}</p>}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-primary to-teal text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : t('auth.verify')}
            </motion.button>
          </form>
        )}

        {!showOtp && (
          <p className="text-center text-white/45 text-sm mt-6">
            {m === 'login' ? t('auth.no_account') : t('auth.have_account')}
            <button
              type="button"
              onClick={() => setM(m === 'login' ? 'register' : 'login')}
              className="text-teal font-semibold ml-1 hover:underline"
            >
              {m === 'login' ? t('auth.register') : t('auth.login')}
            </button>
          </p>
        )}
      </motion.div>
    </motion.div>
  )
}
