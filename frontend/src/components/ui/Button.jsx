import { motion } from 'framer-motion';

export const Button = ({ children, loading, variant = 'primary', ...props }) => {
  const variants = {
    // Premium Blue (Login uchun)
    primary: "bg-[#2563eb] border border-blue-400/20 hover:bg-[#1d4ed8] shadow-lg shadow-blue-900/20 text-white",
    
    // Premium Emerald (Register uchun)
    success: "bg-[#059669] border border-emerald-400/20 hover:bg-[#047857] shadow-lg shadow-emerald-900/20 text-white",
    
    // Google Style (Secondary)
    secondary: "bg-white/10 border border-white/20 text-white hover:bg-white hover:text-black shadow-lg shadow-white/5 backdrop-blur-md"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.01, y: -1 }} // Juda nafis va professional harakat
      whileTap={{ scale: 0.98 }}
      className={`
        relative w-full py-3.5 px-6 rounded-2xl font-bold transition-all duration-300
        flex items-center justify-center gap-3 overflow-hidden group 
        ${variants[variant]} ${loading ? 'opacity-70 cursor-not-allowed' : ''}
      `}
      {...props}
    >
      {loading ? (
        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <span className="flex items-center gap-2 tracking-wide font-semibold">
          {children}
        </span>
      )}
    </motion.button>
  );
};