import { motion } from 'framer-motion'
import Button from './Button'

export default function EmptyState({
  title,
  description,
  icon: Icon,
  actionText,
  onActionClick,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 border border-borderColor rounded-xl bg-card/20 glass max-w-md mx-auto ${className}`}>
      {Icon && (
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="p-4 bg-primary/10 text-accent rounded-full mb-4 border border-accent/20"
        >
          <Icon className="h-10 w-10 stroke-[1.5]" />
        </motion.div>
      )}
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-text-muted text-xs mb-5 max-w-[280px] leading-relaxed">{description}</p>
      {actionText && onActionClick && (
        <Button onClick={onActionClick} variant="glass" size="sm">
          {actionText}
        </Button>
      )}
    </div>
  )
}
