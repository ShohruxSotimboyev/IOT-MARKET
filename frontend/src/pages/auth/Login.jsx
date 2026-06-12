import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Lock, LogIn, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';

const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { staggerChildren: 0.08, duration: 0.5 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 }
};

const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail]       = useState('');
  const [phone, setPhone]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // ✅ TUZATILGAN: email yoki phone — bittasi bo'lsa yetarli
    const identifier = email.trim() || phone.trim();
    if (!identifier) {
      return toast.error("Email yoki telefon raqamini kiriting!");
    }
    if (!password) {
      return toast.error("Parolni kiriting!");
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', { identifier, password });
      toast.success(res.data.message);
      navigate('/verify-otp', { state: { email: res.data.email || email } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Kirishda xatolik!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] relative overflow-hidden font-sans p-4">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/8 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/6 blur-[120px] rounded-full pointer-events-none" />

      <div className="absolute top-5 right-5 z-20">
        <LanguageSwitcher />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-[430px]"
      >
        <div className="p-8 md:p-10 bg-white/[0.03] backdrop-blur-3xl rounded-[32px] border border-white/10 shadow-2xl shadow-black/50">

          <motion.div variants={itemVariants} className="text-center mb-8">
            <motion.div
              whileHover={{ rotate: 8, scale: 1.08 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="w-16 h-16 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-cyan-500/25 border border-white/10"
            >
              <Cpu className="text-white" size={30} />
            </motion.div>
            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">
              IOT <span className="text-cyan-400 font-light text-3xl">Market</span>
            </h2>
            <p className="text-slate-400 mt-2 text-sm font-medium">{t('auth.sign_in_desc')}</p>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-6">
            <h3 className="text-white font-bold text-xl">{t('auth.login_title')}</h3>
          </motion.div>

          {/* ✅ TUZATILGAN: required={false} — biri bo'lsa yetarli */}
          <form onSubmit={handleLogin} autoComplete="off" className="space-y-1">
            <motion.div variants={itemVariants}>
              <Input
                icon={Mail}
                type="email"
                placeholder={t('auth.email')}
                onChange={(e) => setEmail(e.target.value)}
                // required olib tashlandi — phone bilan ham kirsa bo'ladi
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Input
                icon={Phone}
                type="text"
                placeholder={t('auth.phone')}
                onChange={(e) => setPhone(e.target.value)}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Input
                icon={Lock}
                type="password"
                placeholder={t('auth.password')}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </motion.div>

            <motion.div variants={itemVariants} className="pt-2">
              <Button loading={loading} type="submit" variant="primary">
                {t('auth.login_btn')} <LogIn size={18} />
              </Button>
            </motion.div>
          </form>

          <motion.div variants={itemVariants} className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-slate-600 text-xs uppercase tracking-widest">{t('auth.or')}</span>
            <div className="flex-1 h-px bg-white/8" />
          </motion.div>

          <motion.div variants={itemVariants}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`}
            >
              <img src="https://www.svgrepo.com/show/355037/google.svg" className="w-5 h-5" alt="google" />
              {t('auth.google_login')}
            </Button>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-7 text-center">
            <span className="text-slate-500 text-sm">{t('auth.no_account')} </span>
            <button
              onClick={() => navigate('/register')}
              className="text-cyan-400 font-bold text-sm hover:underline transition-all"
            >
              {t('auth.go_register')}
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
