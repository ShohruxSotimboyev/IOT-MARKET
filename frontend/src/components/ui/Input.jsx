import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export const Input = ({ icon: Icon, type, ...props }) => {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';

  return (
    <motion.div 
      variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }}
      className="relative mb-5 group"
    >
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 z-10 group-focus-within:text-cyan-400 transition-colors">
        {Icon && <Icon size={20} />}
      </div>
      <input
        type={isPassword ? (show ? 'text' : 'password') : type}
        {...props}
        className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl text-white outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/50 transition-all duration-300 backdrop-blur-md placeholder:text-slate-600"
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
        >
          {show ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      )}
    </motion.div>
  );
};