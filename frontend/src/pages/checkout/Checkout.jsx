import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ShieldCheck, Check, ChevronRight, Lock, Zap, Sparkles, Home } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import api from '../../api/axios';

const DeliveryIcon = () => (
  <div style={{ width: '100%', paddingBottom: '40%', position: 'relative' }}>
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-teal-500/10 border border-white/10 flex flex-col items-center justify-center text-center p-6">
      <Sparkles size={40} className="text-teal mb-4 opacity-80" />
      <h3 className="text-white font-bold text-lg mb-2">{/* label handled in component */}Yetkazib berish ma'lumotlari</h3>
      <p className="text-white/40 text-sm">Biz buyurtmani ushbu manzilga yetkazib beramiz. Operator siz bilan tez orada bog'lanadi.</p>
    </div>
  </div>
);


const fmt = n => n.toLocaleString('uz-UZ');

const GlassInput = ({ label, error, mono, ...props }) => (
  <div>
    {label && <label className="block text-xs font-bold tracking-widest text-white/50 mb-2">{label}</label>}
    <input {...props} className={`w-full px-5 py-4 rounded-2xl bg-white/[0.06] border ${error ? 'border-red-400/60' : 'border-white/12'} text-white placeholder-white/25 outline-none focus:border-teal/60 focus:bg-white/[0.09] transition-all duration-200 text-[15px]`} />
    {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
  </div>
);

const GlassTextarea = ({ label, error, ...props }) => (
  <div>
    {label && <label className="block text-xs font-bold tracking-widest text-white/50 mb-2">{label}</label>}
    <textarea {...props} className={`w-full px-5 py-4 rounded-2xl bg-white/[0.06] border ${error ? 'border-red-400/60' : 'border-white/12'} text-white placeholder-white/25 outline-none focus:border-teal/60 focus:bg-white/[0.09] transition-all duration-200 text-[15px] resize-none h-24`} />
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
  const steps = ["Ma'lumotlar", 'Tasdiqlash', 'Tugallandi'];
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
  const [holderName, setHolderName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState({});
  const [paying, setPaying] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const validate = () => {
    const e = {};
    if (!holderName.trim()) e.name = "Ism va familiya kiritilishi shart";
    if (!phoneNumber.trim()) e.phone = "Telefon raqam kiritilishi shart";
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
          phone: phoneNumber,
        },
        shippingAddress: address,
        note: note,
        txId,
      };

      // MongoDB ga saqlash
      await api.post('/orders', orderData);

      clearCart();
      setStep(3);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
    } catch (err) {
      alert(err?.response?.data?.message || "Xatolik: Buyurtma saqlanmadi!");
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
                  <h2 className="text-white font-bold text-2xl mb-1">Buyurtma ma'lumotlari</h2>
                  <p className="text-white/40 text-sm mb-8">Yetkazib berish uchun ma'lumotlaringizni kiriting</p>
                  <div className="mb-8">
                    <DeliveryIcon />
                  </div>
                  <form onSubmit={handleNext} className="space-y-5">
                    <GlassInput label={t('checkout.first_name') || 'Ism va Familiya'} placeholder="Alisher Karimov" value={holderName} onChange={e => { setHolderName(e.target.value); setErrors(p => ({ ...p, name: '' })); }} error={errors.name} />
                    <GlassInput label="Telefon Raqam" placeholder="+998 90 123 45 67" value={phoneNumber} onChange={e => { setPhoneNumber(e.target.value); setErrors(p => ({ ...p, phone: '' })); }} error={errors.phone} />
                    <GlassInput label="Yetkazib berish manzili" placeholder="Viloyat, shahar, ko'cha, uy..." value={address} onChange={e => { setAddress(e.target.value); }} />
                    <GlassTextarea label="Qo'shimcha izoh" placeholder="Buyurtma uchun qo'shimcha ma'lumotlar..." value={note} onChange={e => { setNote(e.target.value); }} />
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
                  <div className="mb-8"><DeliveryIcon /></div>
                  <div className="rounded-2xl overflow-hidden border border-white/10 mb-8">
                    {[
                      { label: t('checkout.owner') || 'Mijoz', value: holderName || '—' },
                      { label: 'Telefon', value: phoneNumber || '—' },
                      { label: 'Manzil', value: address || '—' },
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
                      { label: 'Telefon', value: phoneNumber || '—' },
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
