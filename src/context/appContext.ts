import { createContext } from 'react'
import type { CurrentUser } from '@/services'

export interface AppContextValue {
  isHydrated: boolean
  isServerUnreachable: boolean
  user: CurrentUser | null
}

export const AppContext = createContext<AppContextValue | null>(null)
