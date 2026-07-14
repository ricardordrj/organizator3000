import { useAppStore } from '@/store/useAppStore'

export function useNotes() {
  const notes = useAppStore((state) => state.notes)
  const addNote = useAppStore((state) => state.addNote)
  const editNote = useAppStore((state) => state.editNote)
  const removeNote = useAppStore((state) => state.removeNote)

  return { notes, addNote, editNote, removeNote }
}
