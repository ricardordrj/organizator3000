import { useState } from 'react'
import { toast } from 'sonner'
import type { SavingsGoal } from '@/models'
import { useSavingsGoals } from '@/hooks'
import { ApiError } from '@/services/apiClient'
import { parseCurrencyInputToCents } from '@/utils/currency.utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

interface ContributeGoalDialogProps {
  goal: SavingsGoal | null
  onOpenChange: (open: boolean) => void
}

export function ContributeGoalDialog({ goal, onOpenChange }: ContributeGoalDialogProps) {
  const { contributeSavingsGoal } = useSavingsGoals()
  const [amount, setAmount] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!goal) return null

  async function handleSubmit() {
    const amountCents = parseCurrencyInputToCents(amount)
    if (amountCents === undefined || amountCents <= 0) {
      setError('Valor inválido')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await contributeSavingsGoal(goal!.id, amountCents)
      toast.success('Valor adicionado à meta')
      setAmount('')
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao adicionar valor')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Adicionar valor — {goal.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="contribute-amount">Valor (R$)</Label>
          <Input
            id="contribute-amount"
            placeholder="0,00"
            inputMode="decimal"
            autoFocus
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" disabled={submitting} onClick={handleSubmit}>
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
