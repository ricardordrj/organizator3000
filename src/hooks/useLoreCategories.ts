import { useAppStore } from '@/store/useAppStore'

export function useLoreCategories() {
  const loreCategories = useAppStore((state) => state.loreCategories)
  const addLoreCategory = useAppStore((state) => state.addLoreCategory)
  const editLoreCategory = useAppStore((state) => state.editLoreCategory)
  const removeLoreCategory = useAppStore((state) => state.removeLoreCategory)

  return { loreCategories, addLoreCategory, editLoreCategory, removeLoreCategory }
}
