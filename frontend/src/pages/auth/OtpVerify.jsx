import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, RefreshCw, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import { useApp } from '../../context/AppContext';

const OTP_LENGTH = 6;
const OTP_SECONDS = 90; // Backend bilan bir xil

const OtpVerify = () => {
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [timeLeft, setTimeLeft] = useState(OTP_SECONDS);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [status, setStatus] = useState('idle'); // idle | success | error

  const inputRefs = useRef([]);
  const timerRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { setAuthUser } = useApp();

  const email = location.state?.email;
  const type = location.state?.type || 'verify';

  // Timer
  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    setTimeLeft(OTP_SECONDS);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    if (!email) { navigate('/login'); return; }
    startTimer();
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
    return () => clearInterval(timerRef.current);
  }, [email, navigate, startTimer]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  // Input o'zgarishi
  const handleChange = (i, val) => {
    const v = val.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = v;
    setDigits(next);
    if (v && i < OTP_LENGTH - 1) inputRefs.current[i + 1]?.focus();
    // Oxirgi raqam kiritilsa avtomatik yuborish
    if (v && i === OTP_LENGTH - 1 && next.every(d => d !== '')) {
      handleVerify(next.join(''));
    }
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && i > 0) inputRefs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < OTP_LENGTH - 1) inputRefs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = [...digits];
    pasted.split('').forEach((ch, idx) => { if (idx < OTP_LENGTH) next[idx] = ch; });
    setDigits(next);
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
    if (pasted.length === OTP_LENGTH) handleVerify(pasted);
  };

  // OTP tekshirish
  const handleVerify = async (otpOverride) => {
    const otp = otpOverride || digits.join('');
    if (otp.length !== OTP_LENGTH) {
      toast.error('6 ta raqam kiriting');
      return;
    }
    if (timeLeft === 0) {
      toast.error('Kod muddati tugagan. Yangi kod so\'rang.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { email, otp });
      setStatus('success');
      clearInterval(timerRef.current);
      toast.success('Muvaffaqiyatli kirish!');
      // accessToken + refreshToken ni saqlash
      setAuthUser(res.data.accessToken, res.data.user || { email });
      if (res.data.refreshToken) {
        localStorage.setItem('refresh_token', res.data.refreshToken);
      }
      setTimeout(() => navigate('/'), 600);
    } catch (err) {
      setStatus('error');
      const data = err.response?.data || {};
      if (data.expired) {
        toast.error('Kod muddati tugagan. Yangi kod so\'rang.');
        setTimeLeft(0);
      } else if (data.tooManyAttempts) {
        toast.error('Juda ko\'p urinish. Yangi kod so\'rang.');
        setDigits(Array(OTP_LENGTH).fill(''));
      } else if (data.attemptsLeft != null) {
        setAttemptsLeft(data.attemptsLeft);
        toast.error(data.message || 'Kod noto\'g\'ri');
        setDigits(Array(OTP_LENGTH).fill(''));
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      } else {
        toast.error(data.message || 'Kod xato!');
        setDigits(Array(OTP_LENGTH).fill(''));
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      }
      setTimeout(() => setStatus('idle'), 1200);
    } finally {
      setLoading(false);
    }
  };

  // Qayta yuborish
  const handleResend = async () => {
    if (timeLeft > 60) {
      toast.error(`Iltimos, ${timeLeft - 60} soniya kuting.`);
      return;
    }
    setResending(true);
    try {
      await api.post('/auth/resend-otp', { email, type });
      toast.success('Yangi kod yuborildi!');
      setDigits(Array(OTP_LENGTH).fill(''));
      setAttemptsLeft(5);
      setStatus('idle');
      startTimer();
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err) {
      const data = err.response?.data || {};
      if (data.retryAfter) {
        toast.error(`${data.retryAfter} soniyadan keyin qayta urinib ko'ring.`);
      } else {
        toast.error(data.message || 'Kod yuborishda xatolik.');
      }
    } finally {
      setResending(false);
    }
  };

  const isExpired = timeLeft === 0;
  const filled = digits.filter(Boolean).length;
  const canResend = timeLeft <= 60; // Oxirgi 30 soniyada yoki tugaganda

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="bg-white/[0.02] backdrop-blur-3xl p-10 rounded-[40px] shadow-2xl w-full max-w-sm text-center border border-white/10"
      >
        {/* Icon */}
        <motion.div
          animate={status === 'success' ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.4 }}
          className="mx-auto mb-6 w-16 h-16 rounded-full flex items-center justify-center"
          style={{
            background: status === 'success'
              ? 'rgba(16,185,129,0.15)'
              : status === 'error'
              ? 'rgba(239,68,68,0.12)'
              : 'rgba(6,182,212,0.1)',
          }}
        >
          {status === 'success'
            ? <CheckCircle size={36} className="text-emerald-400" />
            : status === 'error'
            ? <AlertCircle size={36} className="text-red-400" />
            : <ShieldCheck size={36} className="text-cyan-400" />
          }
        </motion.div>

        <h2 className="text-2xl font-bold text-white mb-1">Tasdiqlash kodi</h2>
        <p className="text-slate-500 text-sm mb-2">
          <span className="text-slate-300">{email}</span> ga yuborilgan
        </p>
        <p className="text-slate-600 text-xs mb-8">6 xonali kodni kiriting</p>

        {/* OTP inputs */}
        <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <motion.input
              key={i}
              ref={el => inputRefs.current[i] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              animate={status === 'error' ? { x: [-4, 4, -4, 4, 0] } : { x: 0 }}
              transition={{ duration: 0.3 }}
              disabled={loading || status === 'success'}
              className="w-11 h-14 rounded-xl text-center text-2xl font-bold font-mono outline-none transition-all duration-200"
              style={{
                background: d ? 'rgba(6,182,212,0.12)' : 'rgba(255,255,255,0.04)',
                border: `1.5px solid ${
                  status === 'success'
                    ? 'rgba(16,185,129,0.6)'
                    : status === 'error'
                    ? 'rgba(239,68,68,0.5)'
                    : d
                    ? 'rgba(6,182,212,0.5)'
                    : 'rgba(255,255,255,0.1)'
                }`,
                color: status === 'success' ? '#34d399' : '#22d3ee',
                caretColor: '#22d3ee',
              }}
            />
          ))}
        </div>

        {/* Timer */}
        <AnimatePresence mode="wait">
          {!isExpired ? (
            <motion.div
              key="timer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2 mb-6"
            >
              <Clock size={14} className={timeLeft <= 30 ? 'text-red-400' : 'text-slate-500'} />
              <span className={`text-sm font-mono font-bold tabular-nums ${
                timeLeft <= 30 ? 'text-red-400' : timeLeft <= 60 ? 'text-amber-400' : 'text-slate-400'
              }`}>
                {formatTime(timeLeft)}
              </span>
              {/* Progress bar */}
              <div className="w-20 h-1 rounded-full bg-white/10 overflow-hidden ml-1">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    width: `${(timeLeft / OTP_SECONDS) * 100}%`,
                    background: timeLeft <= 30
                      ? 'rgb(248,113,113)'
                      : timeLeft <= 60
                      ? 'rgb(251,191,36)'
                      : 'rgb(6,182,212)',
                    transition: 'width 1s linear, background 0.5s',
                  }}
                />
              </div>
            </motion.div>
          ) : (
            <motion.p
              key="expired"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm font-medium mb-6"
            >
              ⏰ Kod muddati tugadi
            </motion.p>
          )}
        </AnimatePresence>

        {/* Urinishlar */}
        {attemptsLeft < 5 && attemptsLeft > 0 && !isExpired && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-amber-400 text-xs mb-4"
          >
            ⚠️ {attemptsLeft} ta urinish qoldi
          </motion.p>
        )}

        {/* Tasdiqlash tugmasi */}
        <motion.button
          onClick={() => handleVerify()}
          disabled={loading || filled < OTP_LENGTH || isExpired || status === 'success'}
          whileHover={!loading && filled === OTP_LENGTH && !isExpired ? { scale: 1.02 } : {}}
          whileTap={!loading ? { scale: 0.98 } : {}}
          className="w-full py-4 rounded-2xl font-bold text-base mb-4 transition-all duration-200 flex items-center justify-center gap-2"
          style={{
            background: (loading || filled < OTP_LENGTH || isExpired)
              ? 'rgba(255,255,255,0.05)'
              : 'linear-gradient(135deg,#0ea5e9,#06b6d4)',
            color: (loading || filled < OTP_LENGTH || isExpired)
              ? 'rgba(255,255,255,0.25)'
              : 'white',
            cursor: (loading || filled < OTP_LENGTH || isExpired) ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
            />
          ) : 'Tasdiqlash'}
        </motion.button>

        {/* Qayta yuborish */}
        <button
          onClick={handleResend}
          disabled={!canResend || resending}
          className="flex items-center justify-center gap-2 w-full py-2 text-sm transition-all duration-200"
          style={{
            color: canResend ? '#94a3b8' : 'rgba(148,163,184,0.3)',
            cursor: canResend ? 'pointer' : 'default',
          }}
        >
          <RefreshCw size={14} className={resending ? 'animate-spin' : ''} />
          {resending
            ? 'Yuborilmoqda...'
            : canResend
            ? 'Yangi kod olish'
            : `${timeLeft - 60} soniyadan keyin qayta yuborish`
          }
        </button>
      </motion.div>
    </div>
  );
};

export default OtpVerify;
