import { motion } from 'framer-motion'

export default function Button({
  children,
  variant = 'primary', // primary | accent | outline | secondary | danger | glass
  size = 'md', // sm | md | lg
  onClick,
  type = 'button',
  disabled = false,
  loading = false,
  className = '',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:pointer-events-none transition-colors duration-200'

  const variants = {
    primary: 'bg-primary hover:bg-blue-600 text-white shadow-md border border-transparent',
    accent: 'bg-accent hover:bg-cyan-500 text-white shadow-md border border-transparent',
    outline: 'border border-borderColor hover:bg-surface text-text-primary',
    secondary: 'bg-surface border border-borderColor hover:bg-card text-text-primary',
    danger: 'bg-danger hover:bg-red-600 text-white shadow-md border border-transparent',
    glass: 'glass hover:bg-white/10 text-text-primary',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-sm',
    md: 'px-4 py-2 text-sm rounded-md',
    lg: 'px-5 py-2.5 text-base rounded-lg',
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled || loading ? 1 : 1.02, y: disabled || loading ? 0 : -1 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </>
      ) : children}
    </motion.button>
  )
}
