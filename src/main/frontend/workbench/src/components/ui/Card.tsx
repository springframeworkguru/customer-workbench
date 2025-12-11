import { cn } from '../../utils/cn'

type CardProps = {
  title?: string
  description?: string
  action?: React.ReactNode
  className?: string
  children: React.ReactNode
}

export function Card({ title, description, action, className, children }: CardProps) {
  return (
    <div className={cn('rounded-xl border border-slate-200 bg-white shadow-sm', className)}>
      {(title || description || action) && (
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-3">
          <div>
            {title && <h2 className="text-base font-semibold text-slate-900">{title}</h2>}
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  )
}
