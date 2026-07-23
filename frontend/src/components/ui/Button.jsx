import { motion } from 'framer-motion';

export const Button = ({ children, loading, variant = 'primary', ...props }) => {
  const variants = {
    // Admin Panel Style Gradient
    primary: "bg-gradient-to-r from-indigo-500 to-cyan-500 border-none hover:opacity-90 shadow-[0_4px_20px_rgba(99,102,241,0.4)] text-white",
    
    // Success matches primary now to keep aesthetic
    success: "bg-gradient-to-r from-indigo-500 to-cyan-500 border-none hover:opacity-90 shadow-[0_4px_20px_rgba(99,102,241,0.4)] text-white",
    
    // Google Style (Secondary)
    secondary: "bg-white/10 border border-white/20 text-white hover:bg-white hover:text-black shadow-lg shadow-white/5 backdrop-blur-md"
  };

  const { className, ...restProps } = props;
  
  return (
    <motion.button
      whileHover={{ scale: 1.01, y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative w-full py-3.5 px-6 rounded-2xl font-bold transition-all duration-300
        flex items-center justify-center gap-3 overflow-hidden group 
        ${variants[variant]} ${loading ? 'opacity-70 cursor-not-allowed' : ''}
        ${className || ''}
      `}
      {...restProps}
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