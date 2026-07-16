import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import type { Income } from '@/models'
import { incomeKindSchema } from '@/models'
import { useIncomes, useFinanceProfiles } from '@/hooks'
import { ApiError } from '@/services/apiClient'
import { parseCurrencyInputToCents } from '@/utils/currency.utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { incomeKindLabels } from './financeLabels'

const incomeFormSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.string().min(1, 'Valor é obrigatório'),
  kind: incomeKindSchema,
})
type IncomeFormValues = z.infer<typeof incomeFormSchema>

function buildDefaultValues(income: Income | null): IncomeFormValues {
  if (!income) return { description: '', amount: '', kind: 'salary' }
  return {
    description: income.description,
    amount: (income.amountCents / 100).toFixed(2).replace('.', ','),
    kind: income.kind,
  }
}

interface IncomeFormDialogProps {
  income?: Income | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function IncomeFormDialog({ income, open, onOpenChange }: IncomeFormDialogProps) {
  const { addIncome, editIncome } = useIncomes()
  const { activeFinanceProfileId } = useFinanceProfiles()
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeFormSchema),
    defaultValues: buildDefaultValues(income ?? null),
  })

  useEffect(() => {
    if (!open) return
    form.reset(buildDefaultValues(income ?? null))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, income])

  async function onSubmit(values: IncomeFormValues) {
    const amountCents = parseCurrencyInputToCents(values.amount)
    if (amountCents === undefined || amountCents <= 0) {
      form.setError('amount', { message: 'Valor inválido' })
      return
    }

    if (!income && !activeFinanceProfileId) {
      toast.error('Selecione um perfil antes de criar a renda')
      return
    }

    setSubmitting(true)
    try {
      if (income) {
        await editIncome(income.id, { description: values.description, amountCents, kind: values.kind })
        toast.success('Renda atualizada com sucesso')
      } else {
        await addIncome({
          description: values.description,
          amountCents,
          kind: values.kind,
          profileId: activeFinanceProfileId!,
        })
        toast.success('Renda criada com sucesso')
      }
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao salvar a renda')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{income ? 'Editar renda' : 'Nova renda'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="kind"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue>{(value: Income['kind']) => incomeKindLabels[value]}</SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(incomeKindLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Salário CLT, Vale Alimentação" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor mensal (R$)</FormLabel>
                  <FormControl>
                    <Input placeholder="0,00" inputMode="decimal" {...field} />
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
                {income ? 'Salvar alterações' : 'Criar renda'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
