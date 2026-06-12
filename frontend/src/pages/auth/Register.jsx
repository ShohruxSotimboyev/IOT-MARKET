import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, UserPlus, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';

const containerVariants = {
  hidden: { opacity: 0, scale: 0.97 },
  show: { opacity: 1, scale: 1, transition: { staggerChildren: 0.07, duration: 0.45 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 }
};

const Register = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ username: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (k) => (e) => setFormData(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return toast.error("Parollar mos kelmadi!");
    setLoading(true);
    try {
      const res = await api.post('/auth/register', formData);
      toast.success(res.data.message);
      navigate('/verify-otp', { state: { email: formData.email } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xatolik!');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-4 font-sans overflow-hidden relative">
      {/* Background glows */}
      <div className="absolute top-[-15%] right-[-10%] w-[45%] h-[45%] bg-emerald-600/7 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/6 blur-[120px] rounded-full pointer-events-none" />

      {/* Language switcher */}
      <div className="absolute top-5 right-5 z-20">
        <LanguageSwitcher />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-xl"
      >
        <div className="p-8 md:p-10 bg-white/[0.03] backdrop-blur-3xl rounded-[32px] border border-white/10 shadow-2xl shadow-black/50">

          {/* Logo */}
          <motion.div variants={itemVariants} className="text-center mb-7">
            <motion.div
              whileHover={{ rotate: -8, scale: 1.08 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="w-16 h-16 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-cyan-500/25 border border-white/10"
            >
              <Cpu className="text-white" size={30} />
            </motion.div>
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">
              IOT <span className="text-emerald-400 font-light text-2xl">Market</span>
            </h2>
            <p className="text-slate-400 mt-1 text-sm font-medium">{t('auth.sign_in_desc')}</p>
            <p className="text-slate-600 text-xs mt-0.5 font-medium">{t('auth.sign_up_desc')}</p>
          </motion.div>

          {/* Title */}
          <motion.div variants={itemVariants} className="mb-5">
            <h3 className="text-white font-bold text-xl">{t('auth.register_title')}</h3>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-1">
            <motion.div variants={itemVariants}>
              <Input icon={User} placeholder={t('auth.username')} onChange={set('username')} required />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3">
              <motion.div variants={itemVariants}>
                <Input icon={Mail} type="email" placeholder={t('auth.email')} onChange={set('email')} required />
              </motion.div>
              <motion.div variants={itemVariants}>
                <Input icon={Phone} placeholder={t('auth.phone')} onChange={set('phone')} required />
              </motion.div>
              <motion.div variants={itemVariants}>
                <Input icon={Lock} type="password" placeholder={t('auth.password')} onChange={set('password')} required />
              </motion.div>
              <motion.div variants={itemVariants}>
                <Input icon={Lock} type="password" placeholder={t('auth.confirm_password')} onChange={set('confirmPassword')} required />
              </motion.div>
            </div>

            <motion.div variants={itemVariants} className="pt-2">
              <Button loading={loading} type="submit" variant="success">
                {t('auth.register_btn')} <UserPlus size={18} />
              </Button>
            </motion.div>
          </form>

          {/* Divider */}
          <motion.div variants={itemVariants} className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-slate-600 text-xs uppercase tracking-widest">{t('auth.or')}</span>
            <div className="flex-1 h-px bg-white/8" />
          </motion.div>

          {/* Google */}
          <motion.div variants={itemVariants}>
            <Button type="button" variant="secondary" onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`}>
              <img src="https://www.svgrepo.com/show/355037/google.svg" className="w-5 h-5" alt="google" />
              {t('auth.google_login')}
            </Button>
          </motion.div>

          {/* Login link */}
          <motion.div variants={itemVariants} className="mt-6 text-center">
            <span className="text-slate-500 text-sm">{t('auth.have_account')} </span>
            <button
              onClick={() => navigate('/login')}
              className="text-emerald-400 font-bold text-sm hover:underline transition-all"
            >
              {t('auth.go_login')}
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
