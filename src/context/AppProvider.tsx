import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Loader2Icon } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { AppContext } from './appContext'
import type { AppContextValue } from './appContext'

function AppLoader() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3 bg-background">
      <Loader2Icon className="size-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Carregando...</p>
    </div>
  )
}

export function AppProvider({ children }: { children: ReactNode }) {
  const hydrate = useAppStore((state) => state.hydrate)
  const isHydrated = useAppStore((state) => state.isHydrated)
  const theme = useAppStore((state) => state.settings.theme)
  const [isServerUnreachable, setIsServerUnreachable] = useState(false)

  useEffect(() => {
    hydrate()
      .then(() => setIsServerUnreachable(false))
      .catch((error) => {
        console.error('Falha ao carregar dados do servidor', error)
        setIsServerUnreachable(true)
      })
  }, [hydrate])

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const resolvedTheme = theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
  }, [theme])

  const value = useMemo<AppContextValue>(
    () => ({ isHydrated, isServerUnreachable }),
    [isHydrated, isServerUnreachable],
  )

  return (
    <AppContext.Provider value={value}>
      {!isHydrated && !isServerUnreachable ? (
        <AppLoader />
      ) : (
        <>
          {isServerUnreachable && (
            <div className="bg-destructive px-4 py-2 text-center text-sm text-white">
              Não foi possível conectar ao servidor. Verifique se ele está rodando.
            </div>
          )}
          {children}
        </>
      )}
    </AppContext.Provider>
  )
}
