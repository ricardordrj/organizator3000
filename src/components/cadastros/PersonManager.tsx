import { useState } from 'react'
import type { FormEvent } from 'react'
import { PlusIcon } from 'lucide-react'
import { toast } from 'sonner'
import { usePeople } from '@/hooks'
import type { Person, PersonRole } from '@/models'
import { ApiError } from '@/services/apiClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'

interface PersonManagerProps {
  role: PersonRole
  roleLabel: string
}

export function PersonManager({ role, roleLabel }: PersonManagerProps) {
  const { people, addPerson, editPerson, removePerson } = usePeople()
  const items = people.filter((p) => p.role === role)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Person | null>(null)
  const [name, setName] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Person | null>(null)
  const [listError, setListError] = useState<string | null>(null)

  function openCreate() {
    setEditing(null)
    setName('')
    setFormError(null)
    setDialogOpen(true)
  }

  function openEdit(person: Person) {
    setEditing(person)
    setName(person.name)
    setFormError(null)
    setDialogOpen(true)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim()) {
      setFormError('Nome é obrigatório')
      return
    }
    setSubmitting(true)
    setFormError(null)
    try {
      if (editing) {
        await editPerson(editing.id, { name: name.trim() })
        toast.success('Cadastro atualizado com sucesso')
      } else {
        await addPerson({ name: name.trim(), role })
        toast.success('Cadastro criado com sucesso')
      }
      setDialogOpen(false)
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Erro ao salvar')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setListError(null)
    try {
      await removePerson(deleteTarget.id)
      setDeleteTarget(null)
    } catch (err) {
      setDeleteTarget(null)
      setListError(err instanceof ApiError ? err.message : 'Erro ao excluir')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{roleLabel}</h3>
        <Button size="sm" onClick={openCreate}>
          <PlusIcon className="size-4" />
          Novo
        </Button>
      </div>

      {listError && <p className="text-sm text-destructive">{listError}</p>}

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum cadastro ainda.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((person) => (
            <li
              key={person.id}
              className="flex items-center justify-between gap-2 rounded-md border p-2 text-sm"
            >
              <span>{person.name}</span>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => openEdit(person)}>
                  Editar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(person)}>
                  Excluir
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar' : 'Novo'} — {roleLabel}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="person-name">Nome</Label>
              <Input id="person-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
              <p className="min-h-[1.25rem] text-sm text-destructive">{formError}</p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget != null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Excluir cadastro"
        description={`Tem certeza que deseja excluir "${deleteTarget?.name}"?`}
        confirmLabel="Excluir"
        onConfirm={handleDelete}
      />
    </div>
  )
}
