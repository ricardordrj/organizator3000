import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import type { UpgradePhase } from '@/models'
import { useUpgradePhases } from '@/hooks'
import { ApiError } from '@/services/apiClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

const phaseFormSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
})
type PhaseFormValues = z.infer<typeof phaseFormSchema>

function buildDefaultValues(phase: UpgradePhase | null): PhaseFormValues {
  return { title: phase?.title ?? '' }
}

interface PhaseFormDialogProps {
  phase?: UpgradePhase | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PhaseFormDialog({ phase, open, onOpenChange }: PhaseFormDialogProps) {
  const { addUpgradePhase, editUpgradePhase } = useUpgradePhases()
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<PhaseFormValues>({
    resolver: zodResolver(phaseFormSchema),
    defaultValues: buildDefaultValues(phase ?? null),
  })

  useEffect(() => {
    if (!open) return
    form.reset(buildDefaultValues(phase ?? null))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, phase])

  async function onSubmit(values: PhaseFormValues) {
    setSubmitting(true)
    try {
      if (phase) {
        await editUpgradePhase(phase.id, { title: values.title })
        toast.success('Fase atualizada com sucesso')
      } else {
        await addUpgradePhase({ title: values.title })
        toast.success('Fase criada com sucesso')
      }
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao salvar a fase')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{phase ? 'Editar fase' : 'Nova fase'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Fase 6: Periféricos" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {phase ? 'Salvar alterações' : 'Criar fase'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
