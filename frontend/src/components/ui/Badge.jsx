export default function Badge({ children, variant = 'info', className = '' }) {
  const variants = {
    info: 'bg-primary/10 text-primary border border-primary/20',
    success: 'bg-success/10 text-success border border-success/20',
    warning: 'bg-warning/10 text-warning border border-warning/20',
    danger: 'bg-danger/10 text-danger border border-danger/20',
    accent: 'bg-accent/10 text-accent border border-accent/20',
    secondary: 'bg-surface text-text-muted border border-borderColor',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant] || variants.info} ${className}`}>
      {children}
    </span>
  )
}
