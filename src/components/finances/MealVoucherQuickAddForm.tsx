import { useState } from 'react'
import type { FormEvent } from 'react'
import { toast } from 'sonner'
import { useMealVoucherPurchases } from '@/hooks'
import { ApiError } from '@/services/apiClient'
import { parseCurrencyInputToCents } from '@/utils/currency.utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function MealVoucherQuickAddForm() {
  const { addMealVoucherPurchase } = useMealVoucherPurchases()
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!description.trim()) {
      toast.error('Descreve o que foi comprado')
      return
    }
    const amountCents = parseCurrencyInputToCents(amount)
    if (amountCents === undefined || amountCents <= 0) {
      toast.error('Valor inválido')
      return
    }

    setSubmitting(true)
    try {
      await addMealVoucherPurchase({ description: description.trim(), amountCents })
      toast.success('Compra registrada')
      setDescription('')
      setAmount('')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao registrar a compra')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
      <div className="min-w-0 flex-1 space-y-1">
        <label htmlFor="voucher-description" className="text-xs text-muted-foreground">
          O que comprou
        </label>
        <Input
          id="voucher-description"
          placeholder="Ex: Feira da semana, mercado X"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>
      <div className="w-28 space-y-1">
        <label htmlFor="voucher-amount" className="text-xs text-muted-foreground">
          Valor (R$)
        </label>
        <Input
          id="voucher-amount"
          placeholder="0,00"
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </div>
      <Button type="submit" disabled={submitting}>
        Registrar
      </Button>
    </form>
  )
}
