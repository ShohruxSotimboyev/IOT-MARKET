import { forwardRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, AlertCircle, CheckCircle, Info } from 'lucide-react'
import './Input.css'

const Input = forwardRef(({ 
  label, 
  error, 
  success,
  icon: Icon,
  type = 'text',
  className = '',
  helperText,
  ...props 
}, ref) => {
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const inputType = type === 'password' && showPassword ? 'text' : type

  return (
    <div className="input-wrapper">
      {label && (
        <label className="input-label">
          {label}
          {props.required && <span className="required">*</span>}
        </label>
      )}
      
      <div className={`input-container ${isFocused ? 'focused' : ''} ${error ? 'error' : ''} ${success ? 'success' : ''}`}>
        {Icon && (
          <div className="input-icon-left">
            <Icon size={18} />
          </div>
        )}
        
        <input
          ref={ref}
          type={inputType}
          className={`input-field ${Icon ? 'has-icon-left' : ''} ${type === 'password' ? 'has-icon-right' : ''}`}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="input-icon-right"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
        
        {error && (
          <div className="input-status error">
            <AlertCircle size={16} />
          </div>
        )}
        
        {success && !error && (
          <div className="input-status success">
            <CheckCircle size={16} />
          </div>
        )}
      </div>
      
      <AnimatePresence mode="wait">
        {(error || helperText) && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="input-helper"
          >
            {error ? (
              <span className="error-text">
                <AlertCircle size={14} />
                {error}
              </span>
            ) : helperText && (
              <span className="helper-text">
                <Info size={14} />
                {helperText}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

Input.displayName = 'Input'

export default Input
