import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '../../hooks/useToast'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

export default function ToastContainer() {
  const { toasts, removeToast } = useToast()

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-success" />,
    error: <AlertCircle className="h-5 w-5 text-danger" />,
    warning: <AlertCircle className="h-5 w-5 text-warning" />,
    info: <Info className="h-5 w-5 text-primary" />,
  }

  const borders = {
    success: 'border-success/30 bg-success/5',
    error: 'border-danger/30 bg-danger/5',
    warning: 'border-warning/30 bg-warning/5',
    info: 'border-primary/30 bg-primary/5',
  }

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: -20, scale: 0.9, x: 50 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, x: 50 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className={`pointer-events-auto flex items-start gap-3 p-4 border rounded-lg shadow-lg glass ${borders[toast.type] || borders.info}`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {icons[toast.type] || icons.info}
            </div>
            <div className="flex-1 text-sm text-text-primary font-medium pr-2">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-text-muted hover:text-text-primary p-0.5 rounded transition-colors focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
