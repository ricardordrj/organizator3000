import { useAppStore } from '@/store/useAppStore'

export function useTags() {
  const tags = useAppStore((state) => state.tags)
  const addTag = useAppStore((state) => state.addTag)
  const editTag = useAppStore((state) => state.editTag)
  const removeTag = useAppStore((state) => state.removeTag)

  return { tags, addTag, editTag, removeTag }
}
