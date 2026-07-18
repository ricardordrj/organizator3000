import { useMemo, useState } from 'react'
import { PlusIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useUpgradePhases, useUpgradeItems } from '@/hooks'
import type { UpgradePhase, UpgradeItem } from '@/models'
import { ApiError } from '@/services/apiClient'
import { formatCentsBRL } from '@/utils/currency.utils'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { PhaseFormDialog } from '@/components/upgrade/PhaseFormDialog'
import { ItemFormDialog } from '@/components/upgrade/ItemFormDialog'

export function UpgradePlanPage() {
  const { upgradePhases, removeUpgradePhase } = useUpgradePhases()
  const { upgradeItems, toggleUpgradeItem, removeUpgradeItem } = useUpgradeItems()

  const [phaseFormOpen, setPhaseFormOpen] = useState(false)
  const [editingPhase, setEditingPhase] = useState<UpgradePhase | null>(null)
  const [removePhaseTarget, setRemovePhaseTarget] = useState<UpgradePhase | null>(null)

  const [itemFormOpen, setItemFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<UpgradeItem | null>(null)
  const [itemFormPhaseId, setItemFormPhaseId] = useState<string | null>(null)
  const [removeItemTarget, setRemoveItemTarget] = useState<UpgradeItem | null>(null)

  const sortedPhases = useMemo(() => [...upgradePhases].sort((a, b) => a.orderIndex - b.orderIndex), [upgradePhases])

  const itemsByPhase = useMemo(() => {
    const map = new Map<string, UpgradeItem[]>()
    for (const item of upgradeItems) {
      const list = map.get(item.phaseId) ?? []
      list.push(item)
      map.set(item.phaseId, list)
    }
    for (const list of map.values()) list.sort((a, b) => a.orderIndex - b.orderIndex)
    return map
  }, [upgradeItems])

  const totalEstimatedCents = useMemo(
    () => upgradeItems.reduce((sum, item) => sum + (item.priceCents ?? 0), 0),
    [upgradeItems],
  )
  const totalSpentCents = useMemo(
    () => upgradeItems.filter((item) => item.isDone).reduce((sum, item) => sum + (item.priceCents ?? 0), 0),
    [upgradeItems],
  )
  const remainingCents = totalEstimatedCents - totalSpentCents
  const doneCount = useMemo(() => upgradeItems.filter((item) => item.isDone).length, [upgradeItems])
  const totalCount = upgradeItems.length

  function openCreatePhase() {
    setEditingPhase(null)
    setPhaseFormOpen(true)
  }

  function openEditPhase(phase: UpgradePhase) {
    setEditingPhase(phase)
    setPhaseFormOpen(true)
  }

  function openCreateItem(phaseId: string) {
    setEditingItem(null)
    setItemFormPhaseId(phaseId)
    setItemFormOpen(true)
  }

  function openEditItem(item: UpgradeItem) {
    setEditingItem(item)
    setItemFormPhaseId(item.phaseId)
    setItemFormOpen(true)
  }

  async function handleToggleItem(item: UpgradeItem) {
    try {
      await toggleUpgradeItem(item.id)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao atualizar o item')
    }
  }

  async function handleRemovePhase() {
    if (!removePhaseTarget) return
    try {
      await removeUpgradePhase(removePhaseTarget.id)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao remover a fase')
    } finally {
      setRemovePhaseTarget(null)
    }
  }

  async function handleRemoveItem() {
    if (!removeItemTarget) return
    try {
      await removeUpgradeItem(removeItemTarget.id)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao remover o item')
    } finally {
      setRemoveItemTarget(null)
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">Upgrade de PC</h2>
        <Button onClick={openCreatePhase}>
          <PlusIcon className="size-4" />
          Nova fase
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{formatCentsBRL(totalEstimatedCents)}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Investimento estimado</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-emerald-500">{formatCentsBRL(totalSpentCents)}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Já comprado</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-destructive">{formatCentsBRL(remainingCents)}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Restante</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {doneCount}/{totalCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Itens concluídos</CardContent>
        </Card>
      </div>

      {sortedPhases.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma fase cadastrada ainda.</p>
      ) : (
        sortedPhases.map((phase) => {
          const items = itemsByPhase.get(phase.id) ?? []
          const phaseEstimatedCents = items.reduce((sum, item) => sum + (item.priceCents ?? 0), 0)
          return (
            <Card key={phase.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-base">{phase.title}</CardTitle>
                  <div className="flex items-center gap-1">
                    {phaseEstimatedCents > 0 && (
                      <Badge variant="outline">{formatCentsBRL(phaseEstimatedCents)}</Badge>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => openEditPhase(phase)}>
                      Editar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setRemovePhaseTarget(phase)}>
                      Remover
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum item nesta fase ainda.</p>
                ) : (
                  <ul className="space-y-2">
                    {items.map((item) => (
                      <li key={item.id} className="flex items-start gap-2">
                        <Checkbox
                          className="mt-0.5"
                          checked={item.isDone}
                          onCheckedChange={() => handleToggleItem(item)}
                        />
                        <div className="min-w-0 flex-1">
                          <p className={cn('text-sm', item.isDone && 'text-muted-foreground line-through')}>
                            {item.title}
                          </p>
                          {item.notes && <p className="text-xs text-muted-foreground">{item.notes}</p>}
                        </div>
                        {item.priceCents !== undefined && (
                          <span className="text-sm font-medium whitespace-nowrap">
                            {formatCentsBRL(item.priceCents)}
                          </span>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => openEditItem(item)}>
                          Editar
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setRemoveItemTarget(item)}>
                          Remover
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
                <Button variant="outline" size="sm" onClick={() => openCreateItem(phase.id)}>
                  <PlusIcon className="size-4" />
                  Novo item
                </Button>
              </CardContent>
            </Card>
          )
        })
      )}

      <PhaseFormDialog phase={editingPhase} open={phaseFormOpen} onOpenChange={setPhaseFormOpen} />
      <ItemFormDialog item={editingItem} phaseId={itemFormPhaseId} open={itemFormOpen} onOpenChange={setItemFormOpen} />

      <ConfirmDialog
        open={removePhaseTarget != null}
        onOpenChange={(open) => {
          if (!open) setRemovePhaseTarget(null)
        }}
        title="Remover fase"
        description={`Tem certeza que deseja remover "${removePhaseTarget?.title}"? Todos os itens dessa fase também serão removidos.`}
        confirmLabel="Remover"
        onConfirm={handleRemovePhase}
      />
      <ConfirmDialog
        open={removeItemTarget != null}
        onOpenChange={(open) => {
          if (!open) setRemoveItemTarget(null)
        }}
        title="Remover item"
        description={`Tem certeza que deseja remover "${removeItemTarget?.title}"?`}
        confirmLabel="Remover"
        onConfirm={handleRemoveItem}
      />
    </section>
  )
}
