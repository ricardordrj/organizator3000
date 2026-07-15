import { useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'

export function usePeople() {
  const people = useAppStore((state) => state.people)
  const addPerson = useAppStore((state) => state.addPerson)
  const editPerson = useAppStore((state) => state.editPerson)
  const removePerson = useAppStore((state) => state.removePerson)

  const devs = useMemo(() => people.filter((p) => p.role === 'dev'), [people])
  const pos = useMemo(() => people.filter((p) => p.role === 'po'), [people])

  return { people, devs, pos, addPerson, editPerson, removePerson }
}
