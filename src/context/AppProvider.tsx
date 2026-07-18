import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Loader2Icon } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { authService } from '@/services'
import type { CurrentUser } from '@/services'
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
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Primeiro descobre quem está logado (via Cloudflare Access). Admin puxa o
    // app inteiro; quem é do mesão pula o hydrate pesado — a tela do mesão
    // carrega os próprios dados e as demais APIs seriam negadas de qualquer forma.
    authService
      .me()
      .then(async (currentUser) => {
        setUser(currentUser)
        if (currentUser.role === 'admin') {
          await hydrate()
        }
        setIsServerUnreachable(false)
      })
      .catch((error) => {
        console.error('Falha ao carregar dados do servidor', error)
        setIsServerUnreachable(true)
      })
      .finally(() => setIsReady(true))
  }, [hydrate])

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const resolvedTheme = theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
  }, [theme])

  const value = useMemo<AppContextValue>(
    () => ({ isHydrated, isServerUnreachable, user }),
    [isHydrated, isServerUnreachable, user],
  )

  return (
    <AppContext.Provider value={value}>
      {!isReady && !isServerUnreachable ? (
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
