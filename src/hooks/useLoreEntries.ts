import { useAppStore } from '@/store/useAppStore'

export function useLoreEntries() {
  const loreEntries = useAppStore((state) => state.loreEntries)
  const addLoreEntry = useAppStore((state) => state.addLoreEntry)
  const editLoreEntry = useAppStore((state) => state.editLoreEntry)
  const removeLoreEntry = useAppStore((state) => state.removeLoreEntry)

  return { loreEntries, addLoreEntry, editLoreEntry, removeLoreEntry }
}
