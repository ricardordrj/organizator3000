import { useAppStore } from '@/store/useAppStore'

export function useUpgradePhases() {
  const upgradePhases = useAppStore((state) => state.upgradePhases)
  const addUpgradePhase = useAppStore((state) => state.addUpgradePhase)
  const editUpgradePhase = useAppStore((state) => state.editUpgradePhase)
  const removeUpgradePhase = useAppStore((state) => state.removeUpgradePhase)

  return { upgradePhases, addUpgradePhase, editUpgradePhase, removeUpgradePhase }
}
