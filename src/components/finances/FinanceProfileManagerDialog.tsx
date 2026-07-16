import { useState } from 'react'
import type { FormEvent } from 'react'
import { PlusIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useFinanceProfiles } from '@/hooks'
import type { FinanceProfile } from '@/models'
import { ApiError } from '@/services/apiClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'

interface FinanceProfileManagerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FinanceProfileManagerDialog({ open, onOpenChange }: FinanceProfileManagerDialogProps) {
  const { financeProfiles, addFinanceProfile, editFinanceProfile, removeFinanceProfile } = useFinanceProfiles()

  const [editing, setEditing] = useState<FinanceProfile | null>(null)
  const [name, setName] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<FinanceProfile | null>(null)

  function resetForm() {
    setEditing(null)
    setName('')
    setFormError(null)
  }

  function startEdit(profile: FinanceProfile) {
    setEditing(profile)
    setName(profile.name)
    setFormError(null)
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
        await editFinanceProfile(editing.id, { name: name.trim() })
        toast.success('Perfil atualizado com sucesso')
      } else {
        await addFinanceProfile({ name: name.trim() })
        toast.success('Perfil criado com sucesso')
      }
      resetForm()
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Erro ao salvar perfil')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await removeFinanceProfile(deleteTarget.id)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao excluir perfil')
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) resetForm()
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Perfis financeiros</DialogTitle>
        </DialogHeader>

        {financeProfiles.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum perfil cadastrado ainda.</p>
        ) : (
          <ul className="space-y-2">
            {financeProfiles.map((profile) => (
              <li
                key={profile.id}
                className="flex items-center justify-between gap-2 rounded-md border p-2 text-sm"
              >
                <span>{profile.name}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(profile)}>
                    Editar
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(profile)}>
                    Excluir
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleSubmit} className="space-y-2 border-t pt-3">
          <Label htmlFor="finance-profile-name">{editing ? 'Editar perfil' : 'Novo perfil'}</Label>
          <div className="flex gap-2">
            <Input
              id="finance-profile-name"
              placeholder="Ex: Ricardo, Mãe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {editing && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={submitting}>
              {editing ? <>Salvar</> : (
                <>
                  <PlusIcon className="size-4" />
                  Adicionar
                </>
              )}
            </Button>
          </div>
          {formError && <p className="text-sm text-destructive">{formError}</p>}
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>

      <ConfirmDialog
        open={deleteTarget != null}
        onOpenChange={(next) => {
          if (!next) setDeleteTarget(null)
        }}
        title="Excluir perfil"
        description={`Tem certeza que deseja excluir "${deleteTarget?.name}"? Só é possível excluir perfis sem lançamentos.`}
        confirmLabel="Excluir"
        onConfirm={handleDelete}
      />
    </Dialog>
  )
}
