import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/tasks', label: 'Tarefas', end: false },
  { to: '/cadastros', label: 'Cadastros', end: false },
  { to: '/roadmap', label: 'Roadmap', end: false },
  { to: '/settings', label: 'Configurações', end: false },
]

export function AppLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-2 px-4 py-4 sm:px-8">
          <h1 className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-lg font-semibold text-transparent dark:from-violet-400 dark:to-fuchsia-400">
            Organizador Pessoal
          </h1>
          <nav className="flex flex-wrap gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-3 py-1.5 text-sm transition-colors',
                    isActive
                      ? 'bg-gradient-to-r from-violet-500/15 to-fuchsia-500/15 text-foreground ring-1 ring-violet-500/40'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
