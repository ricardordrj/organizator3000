import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import type { SavingsGoal } from '@/models'
import { useSavingsGoals, useFinanceProfiles } from '@/hooks'
import { ApiError } from '@/services/apiClient'
import { parseCurrencyInputToCents } from '@/utils/currency.utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { DeadlineField } from '@/components/tasks/DeadlineField'

const savingsGoalFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  target: z.string().min(1, 'Meta é obrigatória'),
  deadline: z.date().optional(),
})
type SavingsGoalFormValues = z.infer<typeof savingsGoalFormSchema>

function buildDefaultValues(goal: SavingsGoal | null): SavingsGoalFormValues {
  if (!goal) return { name: '', target: '', deadline: undefined }
  return {
    name: goal.name,
    target: (goal.targetCents / 100).toFixed(2).replace('.', ','),
    deadline: goal.deadline,
  }
}

interface SavingsGoalFormDialogProps {
  goal?: SavingsGoal | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SavingsGoalFormDialog({ goal, open, onOpenChange }: SavingsGoalFormDialogProps) {
  const { addSavingsGoal, editSavingsGoal } = useSavingsGoals()
  const { activeFinanceProfileId } = useFinanceProfiles()
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<SavingsGoalFormValues>({
    resolver: zodResolver(savingsGoalFormSchema),
    defaultValues: buildDefaultValues(goal ?? null),
  })

  useEffect(() => {
    if (!open) return
    form.reset(buildDefaultValues(goal ?? null))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, goal])

  async function onSubmit(values: SavingsGoalFormValues) {
    const targetCents = parseCurrencyInputToCents(values.target)
    if (targetCents === undefined || targetCents <= 0) {
      form.setError('target', { message: 'Valor inválido' })
      return
    }

    if (!goal && !activeFinanceProfileId) {
      toast.error('Selecione um perfil antes de criar a meta')
      return
    }

    setSubmitting(true)
    try {
      if (goal) {
        await editSavingsGoal(goal.id, { name: values.name, targetCents, deadline: values.deadline })
        toast.success('Meta atualizada com sucesso')
      } else {
        await addSavingsGoal({
          name: values.name,
          targetCents,
          deadline: values.deadline,
          profileId: activeFinanceProfileId!,
        })
        toast.success('Meta criada com sucesso')
      }
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao salvar a meta')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{goal ? 'Editar meta' : 'Nova meta de economia'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Reserva de emergência" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="target"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta (R$)</FormLabel>
                  <FormControl>
                    <Input placeholder="0,00" inputMode="decimal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prazo (opcional)</FormLabel>
                  <FormControl>
                    <DeadlineField value={field.value} onChange={field.onChange} placeholder="Sem prazo definido" />
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
                {goal ? 'Salvar alterações' : 'Criar meta'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
