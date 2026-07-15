import { useState } from 'react'
import type { FormEvent } from 'react'
import { PlusIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useTags } from '@/hooks'
import type { Tag } from '@/models'
import { ApiError } from '@/services/apiClient'
import { TAG_COLOR_OPTIONS, resolveTagColorClass, tagSwatchClass } from '@/lib/tagColors'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

export function TagManager() {
  const { tags, addTag, editTag, removeTag } = useTags()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Tag | null>(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState<string | undefined>(undefined)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Tag | null>(null)
  const [listError, setListError] = useState<string | null>(null)

  function openCreate() {
    setEditing(null)
    setName('')
    setColor(undefined)
    setFormError(null)
    setDialogOpen(true)
  }

  function openEdit(tag: Tag) {
    setEditing(tag)
    setName(tag.name)
    setColor(tag.color)
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
        await editTag(editing.id, { name: name.trim(), color })
        toast.success('Tag atualizada com sucesso')
      } else {
        await addTag({ name: name.trim(), color })
        toast.success('Tag criada com sucesso')
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
      await removeTag(deleteTarget.id)
      setDeleteTarget(null)
    } catch (err) {
      setDeleteTarget(null)
      setListError(err instanceof ApiError ? err.message : 'Erro ao excluir')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Tags</h3>
        <Button size="sm" onClick={openCreate}>
          <PlusIcon className="size-4" />
          Nova
        </Button>
      </div>

      {listError && <p className="text-sm text-destructive">{listError}</p>}

      {tags.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma tag ainda.</p>
      ) : (
        <ul className="space-y-2">
          {tags.map((tag) => (
            <li key={tag.id} className="flex items-center justify-between gap-2 rounded-md border p-2 text-sm">
              <Badge className={resolveTagColorClass(tag.color)}>{tag.name}</Badge>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => openEdit(tag)}>
                  Editar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(tag)}>
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
            <DialogTitle>{editing ? 'Editar tag' : 'Nova tag'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="tag-name">Nome</Label>
              <Input id="tag-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
              <p className="min-h-[1.25rem] text-sm text-destructive">{formError}</p>
            </div>
            <div className="space-y-1.5">
              <Label>Cor</Label>
              <div className="flex flex-wrap gap-2">
                {TAG_COLOR_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setColor(option)}
                    className={cn(
                      'size-6 rounded-full ring-2 ring-offset-2 ring-offset-background transition-shadow',
                      tagSwatchClass[option],
                      color === option ? 'ring-foreground' : 'ring-transparent',
                    )}
                    aria-label={option}
                  />
                ))}
              </div>
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
        title="Excluir tag"
        description={`Tem certeza que deseja excluir "${deleteTarget?.name}"?`}
        confirmLabel="Excluir"
        onConfirm={handleDelete}
      />
    </div>
  )
}
