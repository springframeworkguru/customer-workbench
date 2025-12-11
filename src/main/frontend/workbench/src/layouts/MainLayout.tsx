import { NavLink } from 'react-router-dom'
import { cn } from '../utils/cn'

type MainLayoutProps = {
  children: React.ReactNode
}

const navLinks = [{ to: '/interactions', label: 'Interactions' }]

function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="text-lg font-bold text-slate-900">Customer Workbench</div>
          <nav className="flex gap-2 text-sm">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-3 py-2 font-medium text-slate-600 transition-colors hover:bg-slate-100',
                    isActive && 'bg-blue-50 text-blue-700',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  )
}

export default MainLayout
