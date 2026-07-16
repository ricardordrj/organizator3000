import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import type { Expense } from '@/models'
import { expenseCategorySchema, expenseKindSchema } from '@/models'
import { useExpenses, useFinanceProfiles } from '@/hooks'
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
import { categoryLabels, kindLabels } from './financeLabels'

const expenseFormSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.string().min(1, 'Valor é obrigatório'),
  category: expenseCategorySchema,
  kind: expenseKindSchema,
  dueDay: z.string().min(1, 'Dia do vencimento é obrigatório'),
})
type ExpenseFormValues = z.infer<typeof expenseFormSchema>

function buildDefaultValues(expense: Expense | null): ExpenseFormValues {
  if (!expense) {
    return { description: '', amount: '', category: 'outros', kind: 'bill', dueDay: '' }
  }
  return {
    description: expense.description,
    amount: (expense.amountCents / 100).toFixed(2).replace('.', ','),
    category: expense.category,
    kind: expense.kind,
    dueDay: String(expense.dueDay),
  }
}

interface ExpenseFormDialogProps {
  expense?: Expense | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExpenseFormDialog({ expense, open, onOpenChange }: ExpenseFormDialogProps) {
  const { addExpense, editExpense } = useExpenses()
  const { activeFinanceProfileId } = useFinanceProfiles()
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: buildDefaultValues(expense ?? null),
  })

  useEffect(() => {
    if (!open) return
    form.reset(buildDefaultValues(expense ?? null))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, expense])

  async function onSubmit(values: ExpenseFormValues) {
    const amountCents = parseCurrencyInputToCents(values.amount)
    if (amountCents === undefined || amountCents <= 0) {
      form.setError('amount', { message: 'Valor inválido' })
      return
    }
    const dueDay = Number(values.dueDay)
    if (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 31) {
      form.setError('dueDay', { message: 'Dia deve ser entre 1 e 31' })
      return
    }

    if (!expense && !activeFinanceProfileId) {
      toast.error('Selecione um perfil antes de criar a despesa')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        description: values.description,
        amountCents,
        category: values.category,
        kind: values.kind,
        dueDay,
      }
      if (expense) {
        await editExpense(expense.id, payload)
        toast.success('Despesa atualizada com sucesso')
      } else {
        await addExpense({ ...payload, profileId: activeFinanceProfileId! })
        toast.success('Despesa criada com sucesso')
      }
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao salvar a despesa')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{expense ? 'Editar despesa' : 'Nova despesa'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Aluguel, Netflix, academia" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <Input placeholder="0,00" inputMode="decimal" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia do vencimento</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="31" placeholder="10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name="kind"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue>{(value: Expense['kind']) => kindLabels[value]}</SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bill">Conta</SelectItem>
                        <SelectItem value="subscription">Assinatura</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue>{(value: Expense['category']) => categoryLabels[value]}</SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(categoryLabels).map(([value, label]) => (
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
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {expense ? 'Salvar alterações' : 'Criar despesa'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
