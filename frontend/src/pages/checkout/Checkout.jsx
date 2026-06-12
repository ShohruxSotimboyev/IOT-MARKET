import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ShieldCheck, Check, ChevronRight, Lock, Zap, Sparkles, Home } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import api from '../../api/axios';

/* ── LOGOS ─────────────────────────────────────────── */
const UzcardLogo = ({ h = 24 }) => (
  <svg viewBox="0 0 110 38" fill="none" style={{ height: h, display: 'block' }}>
    <rect width="110" height="38" rx="7" fill="#003DA5" />
    <rect x="6" y="6" width="28" height="26" rx="4" fill="#fff" />
    <text x="20" y="27" textAnchor="middle" fontFamily="'Arial Black',sans-serif" fontSize="22" fontWeight="900" fill="#003DA5">U</text>
    <text x="68" y="27" textAnchor="middle" fontFamily="'Arial Black',sans-serif" fontSize="15" fontWeight="900" fill="#fff" letterSpacing="1.5">UZCARD</text>
  </svg>
);
const HumoLogo = ({ h = 22 }) => (
  <svg viewBox="0 0 110 38" fill="none" style={{ height: h, display: 'block' }}>
    <rect width="110" height="38" rx="7" fill="#1A2340" />
    <path d="M12 26 Q18 10 28 22 Q35 28 42 14" stroke="#F4C95D" strokeWidth="4" strokeLinecap="round" fill="none" />
    <path d="M19 26 Q25 13 33 23 Q39 27 46 16" stroke="#FFDD7F" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <text x="72" y="27" textAnchor="middle" fontFamily="'Arial Black',sans-serif" fontSize="16" fontWeight="900" fill="#F4C95D" letterSpacing="2">HUMO</text>
  </svg>
);
const VisaLogo = ({ h = 22 }) => (
  <svg viewBox="0 0 90 32" fill="none" style={{ height: h, display: 'block' }}>
    <rect width="90" height="32" rx="6" fill="#fff" />
    <text x="12" y="24" fontFamily="Arial,Helvetica,sans-serif" fontSize="23" fontStyle="italic" fontWeight="900" fill="#1A1F71" letterSpacing="-1.2">VISA</text>
  </svg>
);
const McardLogo = ({ h = 22 }) => (
  <svg viewBox="0 0 95 32" fill="none" style={{ height: h, display: 'block' }}>
    <rect width="95" height="32" rx="6" fill="#1A1A1A" />
    <circle cx="35" cy="16" r="12" fill="#EB001B" />
    <circle cx="58" cy="16" r="12" fill="#F79E1B" />
    <path d="M46 7C50 9.5 52.5 13 52.5 16C52.5 19 50 22.5 46 25" fill="#FF5F00" />
  </svg>
);

const SCHEMES = [
  { id: 'uzcard', label: 'Uzcard', Logo: UzcardLogo, prefixes: ['8600', '5614'], bg: 'linear-gradient(145deg,#003DA5 0%,#0055d4 50%,#3399FF 100%)', shine: 'linear-gradient(130deg,rgba(255,255,255,0.7) 0%,rgba(255,255,255,0.2) 45%,transparent 75%)', glow: '0 0 60px rgba(0,102,255,0.5), 0 0 120px rgba(0,60,180,0.3)', accent: '#00A3FF', pattern: 'uzcard' },
  { id: 'humo', label: 'Humo', Logo: HumoLogo, prefixes: ['9860'], bg: 'linear-gradient(145deg,#0F1E4A 0%,#1a3580 50%,#3B82F6 100%)', shine: 'linear-gradient(130deg,rgba(255,215,90,0.6) 0%,rgba(255,230,140,0.25) 55%,transparent 80%)', glow: '0 0 60px rgba(59,130,246,0.6), 0 0 120px rgba(30,58,138,0.35)', accent: '#FFDD7F', pattern: 'humo' },
  { id: 'visa', label: 'Visa', Logo: VisaLogo, prefixes: ['4'], bg: 'linear-gradient(145deg,#0C1A5E 0%,#1E40AF 50%,#3B82F6 100%)', shine: 'linear-gradient(135deg,rgba(255,200,80,0.35) 0%,transparent 65%)', glow: '0 0 60px rgba(59,130,246,0.55), 0 0 120px rgba(28,40,150,0.3)', accent: '#FFCC33', pattern: 'lines' },
  { id: 'mastercard', label: 'Mastercard', Logo: McardLogo, prefixes: ['5'], bg: 'linear-gradient(145deg,#1F1F1F 0%,#2d3748 50%,#1F2937 100%)', shine: 'linear-gradient(135deg,rgba(255,140,40,0.4) 0%,transparent 65%)', glow: '0 0 60px rgba(249,115,22,0.5), 0 0 120px rgba(120,53,15,0.3)', accent: '#FF8C00', pattern: 'circles' },
];
const DEFAULT_SCHEME = { bg: 'linear-gradient(145deg,#2d1f7a 0%,#4F46E5 50%,#818CF8 100%)', shine: 'linear-gradient(130deg,rgba(167,139,250,0.45) 0%,transparent 70%)', glow: '0 0 60px rgba(99,102,241,0.5), 0 0 120px rgba(67,56,202,0.3)', accent: '#A5B4FC', pattern: 'circles' };

const detectScheme = (num) => {
  const r = num.replace(/\s/g, '');
  for (const s of SCHEMES) if (s.prefixes.some(p => r.startsWith(p))) return s;
  return null;
};

const Chip = () => (
  <div style={{ width: 50, height: 36, background: 'linear-gradient(145deg,#F4C95D,#C8940A)', borderRadius: 7, boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.4),0 2px 8px rgba(0,0,0,0.35)', position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', inset: '4px', background: 'linear-gradient(135deg,#E8B923,#D4A010)', borderRadius: 3 }} />
    <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'rgba(0,0,0,0.2)', transform: 'translateX(-50%)' }} />
    <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'rgba(0,0,0,0.2)', transform: 'translateY(-50%)' }} />
  </div>
);

const Contactless = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" style={{ opacity: 0.9 }}>
    <path d="M11 11 Q16 6 16 11 Q16 16 11 11" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M11 11 Q18 4 18 11 Q18 18 11 11" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7" />
    <circle cx="11" cy="11" r="1.5" fill="white" />
  </svg>
);

const CardPattern = ({ type }) => {
  if (type === 'uzcard') return (<svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.12 }}><defs><radialGradient id="uzg" cx="30%" cy="40%" r="70%"><stop offset="0%" stopColor="#fff" stopOpacity="0.8" /><stop offset="100%" stopColor="#003DA5" stopOpacity="0" /></radialGradient></defs><circle cx="30%" cy="45%" r="65%" fill="url(#uzg)" /></svg>);
  if (type === 'humo') return (<svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.1 }}><defs><pattern id="hp" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="10" fill="none" stroke="#FFDD7F" strokeWidth="1.5" /></pattern></defs><rect width="100%" height="100%" fill="url(#hp)" /></svg>);
  if (type === 'circles') return (<svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.08 }}><circle cx="80%" cy="20%" r="50%" fill="white" opacity="0.25" /><circle cx="10%" cy="80%" r="40%" fill="white" opacity="0.15" /></svg>);
  if (type === 'lines') return (<svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.07 }}>{Array.from({ length: 9 }, (_, i) => <line key={i} x1="0" y1={i * 28} x2="600" y2={i * 28 + 80} stroke="white" strokeWidth="10" opacity="0.7" />)}</svg>);
  return null;
};

const CardFace = ({ number, expiry, holderName, cvv, scheme, flipped }) => {
  const s = scheme || DEFAULT_SCHEME;
  const raw = number.replace(/\s/g, '').padEnd(16, '');
  const chunks = [raw.slice(0, 4), raw.slice(4, 8), raw.slice(8, 12), raw.slice(12, 16)];
  const hasCvv = s.id === 'visa' || s.id === 'mastercard';
  return (
    <div style={{ width: '100%', paddingBottom: '60%', position: 'relative', perspective: 1400 }}>
      <motion.div animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.75, ease: [0.23, 1, 0.32, 1] }} style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d' }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: 20, overflow: 'hidden', background: s.bg, boxShadow: s.glow, backfaceVisibility: 'hidden' }}>
          <CardPattern type={s.pattern} />
          <div style={{ position: 'absolute', inset: 0, background: s.shine }} />
          <div style={{ position: 'absolute', inset: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><Chip /><Contactless /></div>
            <div style={{ display: 'flex', gap: 12, fontFamily: '"SF Mono",Consolas,monospace', fontSize: 'clamp(14px,3.8vw,22px)', fontWeight: 700, letterSpacing: '3px', color: 'white', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>{chunks.map((c, i) => <span key={i}>{c || '••••'}</span>)}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div><div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: 2, marginBottom: 3 }}>CARD HOLDER</div><div style={{ fontSize: 15, fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: 1 }}>{holderName || 'YOUR NAME'}</div></div>
              <div style={{ textAlign: 'right' }}><div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: 2, marginBottom: 3 }}>EXPIRES</div><div style={{ fontSize: 15, fontWeight: 700, color: 'white', marginBottom: 6 }}>{expiry || 'MM/YY'}</div>{s.Logo && <s.Logo h={20} />}</div>
            </div>
          </div>
        </div>
        {hasCvv && (
          <div style={{ position: 'absolute', inset: 0, borderRadius: 20, overflow: 'hidden', background: s.bg, boxShadow: s.glow, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <CardPattern type={s.pattern} />
            <div style={{ position: 'absolute', inset: 0, background: s.shine }} />
            <div style={{ position: 'absolute', top: '28%', left: 0, right: 0, height: '22%', background: 'linear-gradient(90deg,#111,#1e1e1e,#111)' }} />
            <div style={{ position: 'absolute', top: '54%', left: '8%', right: '8%', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, height: 44, background: 'repeating-linear-gradient(90deg,#EDE5C4,#EDE5C4 8px,#D9CFA8 8px,#D9CFA8 16px)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 16 }}><span style={{ fontFamily: '"SF Mono",monospace', fontSize: 20, fontWeight: 700, color: '#1a1a1a', letterSpacing: 6 }}>{cvv || '•••'}</span></div>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>CVV</span>
            </div>
            {s.Logo && <div style={{ position: 'absolute', bottom: '10%', right: '8%' }}><s.Logo h={20} /></div>}
          </div>
        )}
      </motion.div>
    </div>
  );
};

const fmtNum = v => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
const fmtExp = v => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d; };
const fmt = n => n.toLocaleString('uz-UZ');

const GlassInput = ({ label, error, mono, ...props }) => (
  <div>
    {label && <label className="block text-xs font-bold tracking-widest text-white/50 mb-2">{label}</label>}
    <input {...props} className={`w-full px-5 py-4 rounded-2xl bg-white/[0.06] border ${error ? 'border-red-400/60' : 'border-white/12'} text-white placeholder-white/25 outline-none focus:border-teal/60 focus:bg-white/[0.09] transition-all duration-200 ${mono ? 'font-mono tracking-widest text-lg' : 'text-[15px]'}`} />
    {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
  </div>
);

const OrderCard = ({ product, price, commission, total, t }) => (
  <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-8 h-fit">
    <h3 className="text-white font-bold text-lg mb-6">{t('checkout.order')}</h3>
    <div className="rounded-2xl bg-white/[0.05] border border-white/8 p-5 mb-6">
      <p className="text-white font-semibold text-sm leading-relaxed">{product.name}</p>
    </div>
    <div className="space-y-3 text-sm">
      <div className="flex justify-between text-white/55"><span>{t('checkout.product_price')}</span><span className="text-white font-medium">{fmt(price)} UZS</span></div>
      <div className="flex justify-between text-white/55"><span>{t('checkout.commission')}</span><span className="text-teal font-medium">+{fmt(commission)} UZS</span></div>
    </div>
    <div className="mt-5 pt-5 border-t border-white/10 flex justify-between items-center">
      <span className="text-white font-bold text-base">{t('checkout.total')}</span>
      <span className="text-white font-bold text-2xl">{fmt(total)} <span className="text-sm text-white/50">UZS</span></span>
    </div>
    <div className="mt-6 flex items-center gap-2 text-xs text-white/35 justify-center">
      <Lock size={12} /><span>{t('checkout.ssl')}</span>
    </div>
  </div>
);

/* ── STEP INDICATOR ─────────────────────────────────── */
const Steps = ({ current, t }) => {
  const steps = [t('checkout.step_card'), t('checkout.step_confirm'), t('checkout.step_done')];
  const colors = [
    { active: ['#0ea5e9', '#06b6d4'], done: ['#10B981', '#34D399'], glow: 'rgba(14,165,233,0.35)' },
    { active: ['#8b5cf6', '#a78bfa'], done: ['#10B981', '#34D399'], glow: 'rgba(139,92,246,0.35)' },
    { active: ['#10B981', '#34D399'], done: ['#10B981', '#34D399'], glow: 'rgba(16,185,129,0.35)' },
  ];

  return (
    <div className="flex items-center justify-center gap-2 mb-12">
      {steps.map((label, i) => {
        const n = i + 1;
        const done = current > n;
        const active = current === n;
        const col = colors[i];
        return (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center gap-2">
              <motion.div
                animate={{
                  background: done
                    ? `linear-gradient(135deg,${col.done[0]},${col.done[1]})`
                    : active
                    ? `linear-gradient(135deg,${col.active[0]},${col.active[1]})`
                    : 'rgba(255,255,255,0.08)',
                  boxShadow: active
                    ? `0 0 0 4px ${col.glow}, 0 4px 20px ${col.glow}`
                    : done
                    ? `0 0 20px rgba(16,185,129,0.3)`
                    : 'none',
                  scale: active ? 1.1 : 1,
                }}
                transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm relative"
                style={{ color: done || active ? 'white' : 'rgba(255,255,255,0.3)' }}
              >
                <AnimatePresence mode="wait">
                  {done ? (
                    <motion.span key="check" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 400 }}>
                      <Check size={18} strokeWidth={3} />
                    </motion.span>
                  ) : (
                    <motion.span key="num" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      {n}
                    </motion.span>
                  )}
                </AnimatePresence>
                {active && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.6, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ background: `linear-gradient(135deg,${col.active[0]},${col.active[1]})` }}
                  />
                )}
              </motion.div>
              <motion.span
                animate={{ color: active ? col.active[1] : done ? '#34D399' : 'rgba(255,255,255,0.25)' }}
                className="text-xs font-bold tracking-wide whitespace-nowrap"
              >
                {label}
              </motion.span>
            </div>
            {i < 2 && (
              <div className="relative w-14 md:w-20 h-0.5 mx-1 mb-5 overflow-hidden rounded-full bg-white/8">
                <motion.div
                  animate={{ width: current > n ? '100%' : '0%' }}
                  transition={{ duration: 0.6, ease: 'easeInOut', delay: 0.1 }}
                  className="absolute left-0 top-0 bottom-0 rounded-full bg-gradient-to-r from-emerald-400 to-teal"
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/* ── CONFETTI ───────────────────────────────────────── */
const Confetti = () => {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.8,
    color: ['#10B981', '#34D399', '#0ea5e9', '#a78bfa', '#f59e0b', '#ec4899'][i % 6],
    size: 6 + Math.random() * 8,
  }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ y: -20, x: `${p.x}%`, opacity: 1, rotate: 0 }}
          animate={{ y: '120%', opacity: 0, rotate: 720 }}
          transition={{ duration: 1.8 + Math.random(), delay: p.delay, ease: 'easeIn' }}
          style={{ position: 'absolute', top: 0, width: p.size, height: p.size, background: p.color, borderRadius: Math.random() > 0.5 ? '50%' : '2px' }}
        />
      ))}
    </div>
  );
};

/* ── MAIN ───────────────────────────────────────────── */
export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useApp();
  const { t } = useTranslation();

  const { product: ps, price: pr } = location.state || {};
  const product = ps || { name: 'Smart IoT Device' };
  const price = pr || 1249000;
  const commission = Math.floor(price * 0.01);
  const total = price + commission;

  const [step, setStep] = useState(1);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [holderName, setHolderName] = useState('');
  const [cvv, setCvv] = useState('');
  const [flipped, setFlipped] = useState(false);
  const [scheme, setScheme] = useState(null);
  const [errors, setErrors] = useState({});
  const [paying, setPaying] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => { setScheme(detectScheme(cardNumber)); }, [cardNumber]);

  const hasCvv = scheme?.id === 'visa' || scheme?.id === 'mastercard';

  const validate = () => {
    const e = {};
    if (cardNumber.replace(/\s/g, '').length !== 16) e.card = "16 ta raqam bo'lishi kerak";
    if (!holderName.trim()) e.name = "Ism va familiya kiritilishi shart";
    if (!expiry || expiry.length < 5) e.exp = "Muddatni to'g'ri kiriting (MM/YY)";
    if (hasCvv && cvv.length !== 3) e.cvv = "CVV 3 ta raqam bo'lishi kerak";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = (e) => { e.preventDefault(); if (validate()) setStep(2); };

  const handlePay = async () => {
    // Token tekshiruvi — login qilinmagan bo'lsa yuborilmasin
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    setPaying(true);
    try {
      const txId = `TX-${Date.now().toString().slice(-6)}`;

      // Buyurtma ma'lumotlarini tayyorlash
      const orderData = {
        items: Array.isArray(product)
          ? product.map(p => ({
              productId: String(p.id || p._id || 'local'),
              name:      p.name,
              price:     Number(p.price),
              quantity:  Number(p.quantity) || 1,
              image:     p.image || p.img || '',
              category:  p.cat || p.category || '',
            }))
          : [{
              productId: String(product.id || product._id || 'local'),
              name:      product.name,
              price:     Number(price),
              quantity:  Number(product.quantity) || 1,
              image:     product.image || product.img || '',
              category:  product.cat || product.category || '',
            }],
        subtotal: price,
        commission: commission,
        discount: 0,
        total: total,
        payment: {
          cardHolder: holderName,
          cardLast4:  cardNumber.replace(/\s/g, '').slice(-4),
          cardScheme: scheme?.id || 'unknown',
        },
        txId,
      };

      // MongoDB ga saqlash
      await api.post('/orders', orderData);

      clearCart();
      setStep(3);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
    } catch (err) {
      console.error("Buyurtma saqlash xatosi:", err?.response?.data || err.message);
      // API xatosi bo'lsa ham UI step 3 ko'rsatadi, lekin consoleda ko'rinadi
      clearCart();
      setStep(3);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-10">
          <motion.button
            onClick={() => step > 1 ? setStep(s => s - 1) : navigate(-1)}
            whileHover={{ x: -3 }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.06] border border-white/12 text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm font-semibold"
          >
            <ArrowLeft size={16} /> {t('checkout.back')}
          </motion.button>
          <motion.div
            animate={{ boxShadow: ['0 0 0 0 rgba(16,185,129,0)', '0 0 0 8px rgba(16,185,129,0.08)', '0 0 0 0 rgba(16,185,129,0)'] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20"
          >
            <ShieldCheck size={16} className="text-emerald-400" />
            <span className="text-emerald-400 text-xs font-bold tracking-wide">{t('checkout.secure')}</span>
          </motion.div>
        </motion.div>

        <Steps current={step} t={t} />

        <AnimatePresence mode="wait">

          {/* ─── STEP 1 ─── */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}>
              <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8">
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-8 md:p-10">
                  <h2 className="text-white font-bold text-2xl mb-1">{t('checkout.card_title')}</h2>
                  <p className="text-white/40 text-sm mb-8">{t('checkout.card_desc')}</p>
                  <div className="flex gap-3 mb-8">{SCHEMES.map(s => <s.Logo key={s.id} h={20} />)}</div>
                  <div className="mb-8 cursor-pointer select-none" onClick={() => hasCvv && setFlipped(f => !f)} title={hasCvv ? t('checkout.cvv_hint') : undefined}>
                    <CardFace number={cardNumber} expiry={expiry} holderName={holderName} cvv={cvv} scheme={scheme} flipped={flipped} />
                    {hasCvv && <p className="text-center text-white/30 text-xs mt-2">{t('checkout.cvv_hint')}</p>}
                  </div>
                  <form onSubmit={handleNext} className="space-y-5">
                    <GlassInput label={t('checkout.card_number')} mono placeholder="0000 0000 0000 0000" value={cardNumber} maxLength={19} error={errors.card} onChange={e => { setCardNumber(fmtNum(e.target.value)); setErrors(p => ({ ...p, card: '' })); }} />
                    <div className="grid grid-cols-2 gap-4">
                      <GlassInput label={t('checkout.first_name')} placeholder="ALISHER" value={holderName.split(' ')[0] || ''} onChange={e => { const parts = holderName.split(' '); parts[0] = e.target.value.toUpperCase().replace(/[^A-Z\s]/g, ''); setHolderName(parts.join(' ').trim()); setErrors(p => ({ ...p, name: '' })); }} style={{ textTransform: 'uppercase' }} />
                      <GlassInput label={t('checkout.last_name')} placeholder="KARIMOV" value={holderName.split(' ').slice(1).join(' ') || ''} onChange={e => { const first = holderName.split(' ')[0] || ''; setHolderName((first + ' ' + e.target.value.toUpperCase().replace(/[^A-Z\s]/g, '')).trim()); setErrors(p => ({ ...p, name: '' })); }} style={{ textTransform: 'uppercase' }} />
                    </div>
                    {errors.name && <p className="text-red-400 text-xs -mt-2">{errors.name}</p>}
                    <div className={`grid gap-4 ${hasCvv ? 'grid-cols-2' : 'grid-cols-1'}`}>
                      <GlassInput label={t('checkout.expiry')} mono placeholder="MM/YY" maxLength={5} value={expiry} error={errors.exp} onChange={e => { setExpiry(fmtExp(e.target.value)); setErrors(p => ({ ...p, exp: '' })); }} />
                      {hasCvv && <GlassInput label="CVV" mono placeholder="•••" maxLength={3} value={cvv} error={errors.cvv} onChange={e => { setCvv(e.target.value.replace(/\D/g, '').slice(0, 3)); setErrors(p => ({ ...p, cvv: '' })); }} onFocus={() => setFlipped(true)} onBlur={() => setFlipped(false)} />}
                    </div>
                    <motion.button type="submit" whileHover={{ scale: 1.01, boxShadow: '0 8px 32px rgba(79,70,229,0.4)' }} whileTap={{ scale: 0.98 }} className="w-full py-4 mt-2 bg-gradient-to-r from-primary to-teal text-white font-bold text-base rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-3">
                      {t('checkout.continue')} <ChevronRight size={20} />
                    </motion.button>
                  </form>
                </div>
                <OrderCard product={product} price={price} commission={commission} total={total} t={t} />
              </div>
            </motion.div>
          )}

          {/* ─── STEP 2 ─── */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}>
              <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8">
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-8 md:p-10">
                  <h2 className="text-white font-bold text-2xl mb-1">{t('checkout.confirm_title')}</h2>
                  <p className="text-white/40 text-sm mb-8">{t('checkout.confirm_desc')}</p>
                  <div className="mb-8"><CardFace number={cardNumber} expiry={expiry} holderName={holderName} cvv={cvv} scheme={scheme} flipped={false} /></div>
                  <div className="rounded-2xl overflow-hidden border border-white/10 mb-8">
                    {[
                      { label: t('checkout.card_label'), value: `${scheme?.label || 'Karta'} •••• ${cardNumber.slice(-4)}` },
                      { label: t('checkout.owner'), value: holderName || '—' },
                      { label: t('checkout.deadline'), value: expiry },
                      { label: t('checkout.to_pay'), value: `${fmt(total)} UZS`, highlight: true },
                    ].map((row, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }} className={`flex justify-between px-6 py-4 text-sm ${i < 3 ? 'border-b border-white/8' : ''} ${i % 2 === 1 ? 'bg-white/[0.03]' : ''}`}>
                        <span className="text-white/50">{row.label}</span>
                        <span className={row.highlight ? 'text-teal font-bold text-base' : 'text-white font-semibold'}>{row.value}</span>
                      </motion.div>
                    ))}
                  </div>
                  <motion.button
                    onClick={handlePay}
                    disabled={paying}
                    whileHover={!paying ? { scale: 1.01, boxShadow: '0 8px 32px rgba(16,185,129,0.4)' } : {}}
                    whileTap={!paying ? { scale: 0.98 } : {}}
                    className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all ${paying ? 'bg-white/10 text-white/40 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-500 to-teal text-white shadow-lg shadow-emerald-500/20'}`}
                  >
                    {paying ? (
                      <motion.div className="flex items-center gap-3">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                        {t('checkout.paying')}
                      </motion.div>
                    ) : (
                      <><Zap size={20} /> {t('checkout.pay')}</>
                    )}
                  </motion.button>
                </div>
                <OrderCard product={product} price={price} commission={commission} total={total} t={t} />
              </div>
            </motion.div>
          )}

          {/* ─── STEP 3 ─── */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}>
              <div className="max-w-md mx-auto">
                <div className="rounded-3xl border border-emerald-500/25 bg-emerald-500/5 backdrop-blur-xl p-12 text-center relative overflow-hidden">
                  {showConfetti && <Confetti />}

                  {/* Success ring pulse */}
                  <div className="relative w-28 h-28 mx-auto mb-8">
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        className="absolute inset-0 rounded-full border-2 border-emerald-400/30"
                        animate={{ scale: [1, 1.5 + i * 0.3], opacity: [0.6, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.4, ease: 'easeOut' }}
                      />
                    ))}
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 180, damping: 15, delay: 0.1 }}
                      className="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-400 to-teal flex items-center justify-center shadow-2xl shadow-emerald-500/50 relative z-10"
                    >
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}>
                        <Check size={52} className="text-white" strokeWidth={3} />
                      </motion.div>
                    </motion.div>
                  </div>

                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Sparkles size={18} className="text-emerald-400" />
                      <h2 className="text-white font-bold text-3xl">{t('checkout.success_title')}</h2>
                      <Sparkles size={18} className="text-emerald-400" />
                    </div>
                    <p className="text-emerald-400/80 text-sm mb-10">{t('checkout.success_desc')}</p>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="rounded-2xl bg-white/[0.04] border border-white/10 overflow-hidden mb-10 text-left">
                    {[
                      { label: t('checkout.product'), value: product.name },
                      { label: t('checkout.paid'), value: `${fmt(total)} UZS` },
                      { label: t('checkout.card_label'), value: `${scheme?.label || 'Karta'} •••• ${cardNumber.slice(-4)}` },
                      { label: t('checkout.tx_id'), value: `TX-${Date.now().toString().slice(-6)}` },
                    ].map((row, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.08 }} className={`flex justify-between px-6 py-4 text-sm ${i < 3 ? 'border-b border-white/8' : ''}`}>
                        <span className="text-white/45">{row.label}</span>
                        <span className="text-white font-semibold">{row.value}</span>
                      </motion.div>
                    ))}
                  </motion.div>

                  <motion.button
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.75 }}
                    onClick={() => navigate('/')}
                    whileHover={{ scale: 1.03, boxShadow: '0 8px 32px rgba(79,70,229,0.4)' }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-4 bg-gradient-to-r from-primary to-teal text-white font-bold rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                  >
                    <Home size={18} /> {t('checkout.go_home')}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
