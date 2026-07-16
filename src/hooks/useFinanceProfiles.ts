import { useAppStore } from '@/store/useAppStore'

export function useFinanceProfiles() {
  const financeProfiles = useAppStore((state) => state.financeProfiles)
  const addFinanceProfile = useAppStore((state) => state.addFinanceProfile)
  const editFinanceProfile = useAppStore((state) => state.editFinanceProfile)
  const removeFinanceProfile = useAppStore((state) => state.removeFinanceProfile)
  const activeFinanceProfileId = useAppStore((state) => state.activeFinanceProfileId)
  const setActiveFinanceProfileId = useAppStore((state) => state.setActiveFinanceProfileId)

  const activeFinanceProfile = financeProfiles.find((p) => p.id === activeFinanceProfileId) ?? null

  return {
    financeProfiles,
    addFinanceProfile,
    editFinanceProfile,
    removeFinanceProfile,
    activeFinanceProfileId,
    activeFinanceProfile,
    setActiveFinanceProfileId,
  }
}
