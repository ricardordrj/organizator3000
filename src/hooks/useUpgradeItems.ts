import { useAppStore } from '@/store/useAppStore'

export function useUpgradeItems() {
  const upgradeItems = useAppStore((state) => state.upgradeItems)
  const addUpgradeItem = useAppStore((state) => state.addUpgradeItem)
  const editUpgradeItem = useAppStore((state) => state.editUpgradeItem)
  const toggleUpgradeItem = useAppStore((state) => state.toggleUpgradeItem)
  const removeUpgradeItem = useAppStore((state) => state.removeUpgradeItem)

  return { upgradeItems, addUpgradeItem, editUpgradeItem, toggleUpgradeItem, removeUpgradeItem }
}
