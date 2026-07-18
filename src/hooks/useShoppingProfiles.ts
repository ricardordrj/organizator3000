import { useAppStore } from '@/store/useAppStore'

export function useShoppingProfiles() {
  const shoppingProfiles = useAppStore((state) => state.shoppingProfiles)
  const addShoppingProfile = useAppStore((state) => state.addShoppingProfile)
  const editShoppingProfile = useAppStore((state) => state.editShoppingProfile)
  const removeShoppingProfile = useAppStore((state) => state.removeShoppingProfile)
  const activeShoppingProfileId = useAppStore((state) => state.activeShoppingProfileId)
  const setActiveShoppingProfileId = useAppStore((state) => state.setActiveShoppingProfileId)

  const activeShoppingProfile = shoppingProfiles.find((p) => p.id === activeShoppingProfileId) ?? null

  return {
    shoppingProfiles,
    addShoppingProfile,
    editShoppingProfile,
    removeShoppingProfile,
    activeShoppingProfileId,
    activeShoppingProfile,
    setActiveShoppingProfileId,
  }
}
