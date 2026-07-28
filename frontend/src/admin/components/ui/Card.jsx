import { motion } from 'framer-motion'

const Card = ({ children, className = '', ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}

Card.Header = ({ children, className = '' }) => {
  return <div className={`card-header ${className}`}>{children}</div>
}

Card.Body = ({ children, className = '' }) => {
  return <div className={`card-body ${className}`}>{children}</div>
}

Card.Footer = ({ children, className = '' }) => {
  return <div className={`card-footer ${className}`}>{children}</div>
}

export default Card
