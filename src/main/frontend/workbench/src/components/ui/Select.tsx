import { forwardRef } from 'react'
import { cn } from '../../utils/cn'

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      'block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100',
      className,
    )}
    {...props}
  >
    {children}
  </select>
))

Select.displayName = 'Select'
