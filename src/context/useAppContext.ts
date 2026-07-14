import { useContext } from 'react'
import { AppContext } from './appContext'
import type { AppContextValue } from './appContext'

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext deve ser usado dentro de um AppProvider')
  }
  return context
}
