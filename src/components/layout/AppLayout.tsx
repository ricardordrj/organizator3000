import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { MenuIcon, XIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/tasks', label: 'Tarefas', end: false },
  { to: '/cadastros', label: 'Cadastros', end: false },
  { to: '/financas', label: 'Finanças', end: false },
  { to: '/roadmap', label: 'Roadmap', end: false },
  { to: '/settings', label: 'Configurações', end: false },
]

function NavLinks({ onNavigate, vertical = false }: { onNavigate?: () => void; vertical?: boolean }) {
  return (
    <>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'rounded-sm px-3 py-1.5 font-mono text-xs tracking-widest uppercase transition-colors',
              vertical && 'block w-full py-2.5 text-sm',
              isActive
                ? 'bg-gradient-to-r from-primary/20 to-accent/20 text-foreground ring-1 ring-primary/50'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </>
  )
}

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <div className="flex min-h-svh flex-col">
      <header className="relative border-b border-primary/20 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-2 px-4 py-4 sm:px-8">
          <h1 className="font-heading bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-lg font-bold tracking-widest text-transparent uppercase">
            Organizador Pessoal
          </h1>
          <nav className="hidden flex-wrap gap-1 md:flex">
            <NavLinks />
          </nav>
          <button
            type="button"
            className="rounded-sm p-2 text-foreground ring-1 ring-primary/30 md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {mobileOpen ? <XIcon className="size-5" /> : <MenuIcon className="size-5" />}
          </button>
        </div>
        {mobileOpen && (
          <nav className="flex flex-col gap-1 border-t border-primary/20 bg-background px-4 py-2 md:hidden">
            <NavLinks vertical onNavigate={() => setMobileOpen(false)} />
          </nav>
        )}
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
