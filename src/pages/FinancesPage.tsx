import { useMemo, useState } from 'react'
import { PlusIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useExpenses, useSavingsGoals } from '@/hooks'
import type { Expense, SavingsGoal } from '@/models'
import { ApiError } from '@/services/apiClient'
import { formatCentsBRL } from '@/utils/currency.utils'
import { formatDate } from '@/utils/date.utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { ExpenseFormDialog } from '@/components/finances/ExpenseFormDialog'
import { SavingsGoalFormDialog } from '@/components/finances/SavingsGoalFormDialog'
import { ContributeGoalDialog } from '@/components/finances/ContributeGoalDialog'
import { categoryLabels, kindLabels } from '@/components/finances/financeLabels'

export function FinancesPage() {
  const { expenses, markExpensePaid, removeExpense } = useExpenses()
  const { savingsGoals, removeSavingsGoal } = useSavingsGoals()

  const [expenseFormOpen, setExpenseFormOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [removeExpenseTarget, setRemoveExpenseTarget] = useState<Expense | null>(null)

  const [goalFormOpen, setGoalFormOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null)
  const [contributeTarget, setContributeTarget] = useState<SavingsGoal | null>(null)
  const [removeGoalTarget, setRemoveGoalTarget] = useState<SavingsGoal | null>(null)

  const sortedExpenses = useMemo(() => [...expenses].sort((a, b) => a.dueDay - b.dueDay), [expenses])

  const monthlyTotalCents = useMemo(
    () => expenses.reduce((sum, expense) => sum + expense.amountCents, 0),
    [expenses],
  )
  const subscriptionsTotalCents = useMemo(
    () => expenses.filter((e) => e.kind === 'subscription').reduce((sum, e) => sum + e.amountCents, 0),
    [expenses],
  )
  const byCategory = useMemo(() => {
    const map = new Map<string, number>()
    for (const expense of expenses) {
      map.set(expense.category, (map.get(expense.category) ?? 0) + expense.amountCents)
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1])
  }, [expenses])

  function openCreateExpense() {
    setEditingExpense(null)
    setExpenseFormOpen(true)
  }

  function openEditExpense(expense: Expense) {
    setEditingExpense(expense)
    setExpenseFormOpen(true)
  }

  async function handleMarkPaid(expense: Expense) {
    try {
      await markExpensePaid(expense.id)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao marcar como paga')
    }
  }

  async function handleRemoveExpense() {
    if (!removeExpenseTarget) return
    try {
      await removeExpense(removeExpenseTarget.id)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao remover a despesa')
    } finally {
      setRemoveExpenseTarget(null)
    }
  }

  async function handleRemoveGoal() {
    if (!removeGoalTarget) return
    try {
      await removeSavingsGoal(removeGoalTarget.id)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao remover a meta')
    } finally {
      setRemoveGoalTarget(null)
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">Finanças</h2>
        <Button onClick={openCreateExpense}>
          <PlusIcon className="size-4" />
          Nova despesa
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{formatCentsBRL(monthlyTotalCents)}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Total mensal (contas + assinaturas)</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{formatCentsBRL(subscriptionsTotalCents)}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Só assinaturas</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{expenses.length}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Despesas cadastradas</CardContent>
        </Card>
      </div>

      {byCategory.length > 0 && (
        <Card>
          <CardContent className="space-y-2">
            <h3 className="text-sm font-medium">Por categoria</h3>
            <div className="flex flex-wrap gap-2">
              {byCategory.map(([category, cents]) => (
                <Badge key={category} variant="outline" className="gap-1.5">
                  {categoryLabels[category as keyof typeof categoryLabels]}
                  <span className="text-muted-foreground">{formatCentsBRL(cents)}</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Contas e assinaturas</h3>
        {sortedExpenses.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma despesa cadastrada ainda.</p>
        ) : (
          <ul className="space-y-2">
            {sortedExpenses.map((expense) => (
              <Card key={expense.id} className="gap-0 py-0">
                <div className="flex flex-wrap items-center gap-2 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{expense.description}</p>
                    <p className="text-xs text-muted-foreground">Vence dia {expense.dueDay}</p>
                  </div>
                  <Badge variant="outline">{kindLabels[expense.kind]}</Badge>
                  <Badge variant="secondary">{categoryLabels[expense.category]}</Badge>
                  <span className="font-medium">{formatCentsBRL(expense.amountCents)}</span>
                  {expense.isPaidThisCycle ? (
                    <Badge className="border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      Pago este mês
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Pendente</Badge>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={expense.isPaidThisCycle}
                    onClick={() => handleMarkPaid(expense)}
                  >
                    Marcar como pago
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openEditExpense(expense)}>
                    Editar
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setRemoveExpenseTarget(expense)}>
                    Remover
                  </Button>
                </div>
              </Card>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Metas de economia</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingGoal(null)
              setGoalFormOpen(true)
            }}
          >
            <PlusIcon className="size-4" />
            Nova meta
          </Button>
        </div>
        {savingsGoals.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma meta cadastrada ainda.</p>
        ) : (
          <ul className="space-y-2">
            {savingsGoals.map((goal) => {
              const progress = goal.targetCents > 0 ? Math.min(1, goal.currentCents / goal.targetCents) : 0
              return (
                <Card key={goal.id}>
                  <CardContent className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium">{goal.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCentsBRL(goal.currentCents)} de {formatCentsBRL(goal.targetCents)}
                          {goal.deadline && ` · prazo ${formatDate(goal.deadline)}`}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => setContributeTarget(goal)}>
                          Adicionar valor
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingGoal(goal)
                            setGoalFormOpen(true)
                          }}
                        >
                          Editar
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setRemoveGoalTarget(goal)}>
                          Remover
                        </Button>
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${progress * 100}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </ul>
        )}
      </div>

      <ExpenseFormDialog expense={editingExpense} open={expenseFormOpen} onOpenChange={setExpenseFormOpen} />
      <SavingsGoalFormDialog goal={editingGoal} open={goalFormOpen} onOpenChange={setGoalFormOpen} />
      <ContributeGoalDialog
        goal={contributeTarget}
        onOpenChange={(open) => {
          if (!open) setContributeTarget(null)
        }}
      />

      <ConfirmDialog
        open={removeExpenseTarget != null}
        onOpenChange={(open) => {
          if (!open) setRemoveExpenseTarget(null)
        }}
        title="Remover despesa"
        description={`Tem certeza que deseja remover "${removeExpenseTarget?.description}"?`}
        confirmLabel="Remover"
        onConfirm={handleRemoveExpense}
      />
      <ConfirmDialog
        open={removeGoalTarget != null}
        onOpenChange={(open) => {
          if (!open) setRemoveGoalTarget(null)
        }}
        title="Remover meta"
        description={`Tem certeza que deseja remover "${removeGoalTarget?.name}"?`}
        confirmLabel="Remover"
        onConfirm={handleRemoveGoal}
      />
    </section>
  )
}
