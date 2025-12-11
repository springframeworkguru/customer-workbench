import { cn } from '../../utils/cn'

type AlertProps = {
  title?: string
  description?: React.ReactNode
  variant?: 'error' | 'info'
  className?: string
}

const variants = {
  error: 'border-red-200 bg-red-50 text-red-800',
  info: 'border-blue-200 bg-blue-50 text-blue-800',
}

export function Alert({ title, description, variant = 'info', className }: AlertProps) {
  return (
    <div className={cn('rounded-lg border px-4 py-3 text-sm', variants[variant], className)}>
      {title && <div className="font-semibold">{title}</div>}
      {description && <div className="mt-1 leading-relaxed">{description}</div>}
    </div>
  )
}
