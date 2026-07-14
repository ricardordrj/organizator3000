import { createContext } from 'react'

export interface AppContextValue {
  isHydrated: boolean
  isServerUnreachable: boolean
}

export const AppContext = createContext<AppContextValue | null>(null)
