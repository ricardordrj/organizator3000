import { useMemo, useState } from 'react'
import { isSameMonth } from 'date-fns'
import { PlusIcon, XIcon, WalletIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useExpenses, useSavingsGoals, useIncomes, useMealVoucherPurchases, useFinanceProfiles } from '@/hooks'
import type { Expense, SavingsGoal, Income } from '@/models'
import { ApiError } from '@/services/apiClient'
import { formatCentsBRL } from '@/utils/currency.utils'
import { formatDate, formatDateTime } from '@/utils/date.utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { ExpenseFormDialog } from '@/components/finances/ExpenseFormDialog'
import { SavingsGoalFormDialog } from '@/components/finances/SavingsGoalFormDialog'
import { ContributeGoalDialog } from '@/components/finances/ContributeGoalDialog'
import { IncomeFormDialog } from '@/components/finances/IncomeFormDialog'
import { MealVoucherQuickAddForm } from '@/components/finances/MealVoucherQuickAddForm'
import { FinanceProfileSelector } from '@/components/finances/FinanceProfileSelector'
import { categoryLabels, kindLabels, incomeKindLabels } from '@/components/finances/financeLabels'

export function FinancesPage() {
  const { activeFinanceProfileId } = useFinanceProfiles()
  const { expenses: allExpenses, markExpensePaid, removeExpense } = useExpenses()
  const { savingsGoals: allSavingsGoals, removeSavingsGoal } = useSavingsGoals()
  const { incomes: allIncomes, removeIncome } = useIncomes()
  const { mealVoucherPurchases: allMealVoucherPurchases, removeMealVoucherPurchase } = useMealVoucherPurchases()

  const expenses = useMemo(
    () => allExpenses.filter((e) => e.profileId === activeFinanceProfileId),
    [allExpenses, activeFinanceProfileId],
  )
  const savingsGoals = useMemo(
    () => allSavingsGoals.filter((g) => g.profileId === activeFinanceProfileId),
    [allSavingsGoals, activeFinanceProfileId],
  )
  const incomes = useMemo(
    () => allIncomes.filter((i) => i.profileId === activeFinanceProfileId),
    [allIncomes, activeFinanceProfileId],
  )
  const mealVoucherPurchases = useMemo(
    () => allMealVoucherPurchases.filter((p) => p.profileId === activeFinanceProfileId),
    [allMealVoucherPurchases, activeFinanceProfileId],
  )

  const [expenseFormOpen, setExpenseFormOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [removeExpenseTarget, setRemoveExpenseTarget] = useState<Expense | null>(null)

  const [goalFormOpen, setGoalFormOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null)
  const [contributeTarget, setContributeTarget] = useState<SavingsGoal | null>(null)
  const [removeGoalTarget, setRemoveGoalTarget] = useState<SavingsGoal | null>(null)

  const [incomeFormOpen, setIncomeFormOpen] = useState(false)
  const [editingIncome, setEditingIncome] = useState<Income | null>(null)
  const [removeIncomeTarget, setRemoveIncomeTarget] = useState<Income | null>(null)

  const sortedExpenses = useMemo(() => [...expenses].sort((a, b) => a.dueDay - b.dueDay), [expenses])

  const expensesTotalCents = useMemo(
    () => expenses.reduce((sum, expense) => sum + expense.amountCents, 0),
    [expenses],
  )
  const byCategory = useMemo(() => {
    const map = new Map<string, number>()
    for (const expense of expenses) {
      map.set(expense.category, (map.get(expense.category) ?? 0) + expense.amountCents)
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1])
  }, [expenses])

  const incomeTotalCents = useMemo(() => incomes.reduce((sum, income) => sum + income.amountCents, 0), [incomes])
  const mealVoucherIncomeCents = useMemo(
    () => incomes.filter((i) => i.kind === 'meal_voucher').reduce((sum, i) => sum + i.amountCents, 0),
    [incomes],
  )

  const now = useMemo(() => new Date(), [])
  const purchasesThisMonth = useMemo(
    () =>
      [...mealVoucherPurchases]
        .filter((p) => isSameMonth(p.purchasedAt, now))
        .sort((a, b) => b.purchasedAt.getTime() - a.purchasedAt.getTime()),
    [mealVoucherPurchases, now],
  )
  const voucherSpentCents = useMemo(
    () => purchasesThisMonth.reduce((sum, p) => sum + p.amountCents, 0),
    [purchasesThisMonth],
  )
  const voucherBalanceCents = mealVoucherIncomeCents - voucherSpentCents

  const totalExpensesCents = expensesTotalCents + voucherSpentCents
  const netCents = incomeTotalCents - totalExpensesCents

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

  async function handleRemoveIncome() {
    if (!removeIncomeTarget) return
    try {
      await removeIncome(removeIncomeTarget.id)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao remover a renda')
    } finally {
      setRemoveIncomeTarget(null)
    }
  }

  async function handleRemovePurchase(id: string) {
    try {
      await removeMealVoucherPurchase(id)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao remover a compra')
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <WalletIcon className="size-5 text-primary" />
          Finanças
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <FinanceProfileSelector />
          <Button onClick={openCreateExpense}>
            <PlusIcon className="size-4" />
            Nova despesa
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-emerald-500">{formatCentsBRL(incomeTotalCents)}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Renda mensal</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-destructive">{formatCentsBRL(totalExpensesCents)}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Total de gastos (mês)</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className={netCents >= 0 ? 'text-2xl text-emerald-500' : 'text-2xl text-destructive'}>
              {formatCentsBRL(netCents)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Saldo do mês</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-ember">{formatCentsBRL(voucherBalanceCents)}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Saldo vale alimentação</CardContent>
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
              {voucherSpentCents > 0 && (
                <Badge variant="outline" className="gap-1.5">
                  Vale alimentação
                  <span className="text-muted-foreground">{formatCentsBRL(voucherSpentCents)}</span>
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Renda</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingIncome(null)
              setIncomeFormOpen(true)
            }}
          >
            <PlusIcon className="size-4" />
            Nova renda
          </Button>
        </div>
        {incomes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma renda cadastrada ainda.</p>
        ) : (
          <ul className="space-y-2">
            {incomes.map((income) => (
              <Card key={income.id} className="gap-0 py-0">
                <div className="flex flex-wrap items-center gap-2 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{income.description}</p>
                  </div>
                  <Badge variant="outline">{incomeKindLabels[income.kind]}</Badge>
                  <span className="font-medium text-emerald-500">{formatCentsBRL(income.amountCents)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingIncome(income)
                      setIncomeFormOpen(true)
                    }}
                  >
                    Editar
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setRemoveIncomeTarget(income)}>
                    Remover
                  </Button>
                </div>
              </Card>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Vale alimentação — supermercado</h3>
        <Card>
          <CardContent className="space-y-3">
            <MealVoucherQuickAddForm />
            {purchasesThisMonth.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma compra registrada este mês.</p>
            ) : (
              <ul className="space-y-1.5 border-t pt-3">
                {purchasesThisMonth.map((purchase) => (
                  <li key={purchase.id} className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="min-w-0 flex-1 truncate">{purchase.description}</span>
                    <span className="text-xs text-muted-foreground">{formatDateTime(purchase.purchasedAt)}</span>
                    <span className="font-medium">{formatCentsBRL(purchase.amountCents)}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePurchase(purchase.id)}
                      className="text-muted-foreground hover:text-destructive"
                      title="Remover"
                    >
                      <XIcon className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

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
      <IncomeFormDialog income={editingIncome} open={incomeFormOpen} onOpenChange={setIncomeFormOpen} />
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
      <ConfirmDialog
        open={removeIncomeTarget != null}
        onOpenChange={(open) => {
          if (!open) setRemoveIncomeTarget(null)
        }}
        title="Remover renda"
        description={`Tem certeza que deseja remover "${removeIncomeTarget?.description}"?`}
        confirmLabel="Remover"
        onConfirm={handleRemoveIncome}
      />
    </section>
  )
}
