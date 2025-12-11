import { cn } from '../../utils/cn'

type BadgeProps = {
  children: React.ReactNode
  variant?: 'neutral' | 'info'
  className?: string
}

const badgeStyles = {
  neutral: 'bg-slate-100 text-slate-800',
  info: 'bg-blue-100 text-blue-800',
}

export function Badge({ children, variant = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
        badgeStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
