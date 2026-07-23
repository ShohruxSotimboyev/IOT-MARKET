import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export const Input = ({ icon: Icon, type, className, ...props }) => {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';

  return (
    <motion.div 
      variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }}
      className="relative mb-5 group"
    >
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748b] z-10 group-focus-within:text-[#22d3ee] transition-colors">
        {Icon && <Icon size={20} />}
      </div>
      <input
        type={isPassword ? (show ? 'text' : 'password') : type}
        className={`w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] p-4 pl-12 rounded-2xl text-[#ffffff] outline-none focus:ring-2 focus:ring-[rgba(6,182,212,0.4)] focus:border-[rgba(6,182,212,0.5)] transition-all duration-300 backdrop-blur-md placeholder:text-[#475569] ${className || ''}`}
        {...props}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#ffffff] transition-colors"
        >
          {show ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      )}
    </motion.div>
  );
};