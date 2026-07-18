import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboardIcon,
  ListTodoIcon,
  UsersIcon,
  WalletIcon,
  CpuIcon,
  SkullIcon,
  SettingsIcon,
  MoreHorizontalIcon,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTaskDeadlineNotifications } from '@/hooks'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { AmbientGlow } from './AmbientGlow'

interface NavItem {
  to: string
  label: string
  end: boolean
  icon: LucideIcon
}

const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', end: true, icon: LayoutDashboardIcon },
  { to: '/tasks', label: 'Tarefas', end: false, icon: ListTodoIcon },
  { to: '/financas', label: 'Finanças', end: false, icon: WalletIcon },
  { to: '/upgrade-pc', label: 'Upgrade PC', end: false, icon: CpuIcon },
  { to: '/dark-fantasy', label: 'Dark Fantasy', end: false, icon: SkullIcon },
  { to: '/settings', label: 'Configurações', end: false, icon: SettingsIcon },
  { to: '/cadastros', label: 'Cadastros', end: false, icon: UsersIcon },
]

// Barra inferior no mobile só cabe ~4-5 itens sem precisar rolar; o resto vai pro popover "Mais".
const primaryMobileItems = navItems.filter((item) =>
  ['/', '/tasks', '/financas', '/dark-fantasy'].includes(item.to),
)
const overflowMobileItems = navItems.filter((item) => !primaryMobileItems.includes(item))

function DesktopNav() {
  return (
    <nav className="hidden flex-wrap gap-1 md:flex">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-1.5 rounded-sm px-3 py-1.5 font-mono text-xs tracking-widest uppercase transition-colors',
              isActive
                ? 'bg-gradient-to-r from-primary/20 to-accent/20 text-foreground ring-1 ring-primary/50'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )
          }
        >
          <item.icon className="size-3.5 shrink-0" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

function TabBarLink({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        cn(
          'flex flex-1 flex-col items-center gap-0.5 py-2 text-[0.625rem] font-medium tracking-wide uppercase transition-colors',
          isActive ? 'text-primary' : 'text-muted-foreground active:text-foreground',
        )
      }
    >
      {({ isActive }) => (
        <>
          <item.icon
            className={cn('size-5 shrink-0', isActive && 'drop-shadow-[0_0_6px_oklch(from_var(--primary)_l_c_h_/_60%)]')}
          />
          <span className="max-w-full truncate px-0.5">{item.label}</span>
        </>
      )}
    </NavLink>
  )
}

function MobileTabBar() {
  const location = useLocation()
  const isOverflowActive = overflowMobileItems.some(
    (item) => location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to)),
  )

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-primary/20 bg-background/90 backdrop-blur-md md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex">
        {primaryMobileItems.map((item) => (
          <TabBarLink key={item.to} item={item} />
        ))}
        <Popover>
          <PopoverTrigger
            render={
              <button
                type="button"
                className={cn(
                  'flex flex-1 flex-col items-center gap-0.5 py-2 text-[0.625rem] font-medium tracking-wide uppercase transition-colors',
                  isOverflowActive ? 'text-primary' : 'text-muted-foreground active:text-foreground',
                )}
              />
            }
          >
            <MoreHorizontalIcon className="size-5 shrink-0" />
            <span>Mais</span>
          </PopoverTrigger>
          <PopoverContent align="end" side="top" className="w-56 p-1.5">
            {overflowMobileItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors',
                    isActive ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )
                }
              >
                <item.icon className="size-4 shrink-0" />
                {item.label}
              </NavLink>
            ))}
          </PopoverContent>
        </Popover>
      </div>
    </nav>
  )
}

export function AppLayout() {
  useTaskDeadlineNotifications()

  return (
    <div className="flex min-h-svh flex-col">
      <AmbientGlow />
      <header className="relative z-10 border-b border-primary/20 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-2 px-4 py-4 sm:px-8">
          <h1 className="font-heading bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-lg font-bold tracking-widest text-transparent uppercase">
            Organizador Pessoal
          </h1>
          <DesktopNav />
        </div>
      </header>
      <main className="relative z-10 flex-1 pb-20 md:pb-0">
        <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-8">
          <Outlet />
        </div>
      </main>
      <MobileTabBar />
    </div>
  )
}
