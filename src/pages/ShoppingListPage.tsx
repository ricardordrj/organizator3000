import { useMemo, useState } from 'react'
import { PlusIcon, ShoppingCartIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useShoppingProfiles, useShoppingItems } from '@/hooks'
import type { ShoppingItem } from '@/models'
import { ApiError } from '@/services/apiClient'
import { formatCentsBRL } from '@/utils/currency.utils'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { ShoppingProfileSelector } from '@/components/shopping/ShoppingProfileSelector'
import { ShoppingItemFormDialog } from '@/components/shopping/ShoppingItemFormDialog'
import { urgencyLabels, urgencyBadgeClassNames, urgencyOrder } from '@/components/shopping/shoppingLabels'

export function ShoppingListPage() {
  const { activeShoppingProfileId } = useShoppingProfiles()
  const { shoppingItems: allItems, toggleShoppingItem, removeShoppingItem } = useShoppingItems()

  const [itemFormOpen, setItemFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null)
  const [removeItemTarget, setRemoveItemTarget] = useState<ShoppingItem | null>(null)

  const items = useMemo(
    () => allItems.filter((item) => item.profileId === activeShoppingProfileId),
    [allItems, activeShoppingProfileId],
  )

  const sortedItems = useMemo(
    () =>
      [...items].sort((a, b) => {
        if (a.isDone !== b.isDone) return a.isDone ? 1 : -1
        if (a.urgency !== b.urgency) return urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
        return a.orderIndex - b.orderIndex
      }),
    [items],
  )

  const totalEstimatedCents = useMemo(
    () => items.reduce((sum, item) => sum + (item.priceCents ?? 0), 0),
    [items],
  )
  const totalBoughtCents = useMemo(
    () => items.filter((item) => item.isDone).reduce((sum, item) => sum + (item.priceCents ?? 0), 0),
    [items],
  )
  const remainingCents = totalEstimatedCents - totalBoughtCents
  const doneCount = useMemo(() => items.filter((item) => item.isDone).length, [items])

  function openCreateItem() {
    setEditingItem(null)
    setItemFormOpen(true)
  }

  function openEditItem(item: ShoppingItem) {
    setEditingItem(item)
    setItemFormOpen(true)
  }

  async function handleToggleItem(item: ShoppingItem) {
    try {
      await toggleShoppingItem(item.id)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao atualizar o item')
    }
  }

  async function handleRemoveItem() {
    if (!removeItemTarget) return
    try {
      await removeShoppingItem(removeItemTarget.id)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao remover o item')
    } finally {
      setRemoveItemTarget(null)
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <ShoppingCartIcon className="size-5 text-primary" />
          Lista de Compras
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <ShoppingProfileSelector />
          <Button onClick={openCreateItem} disabled={!activeShoppingProfileId}>
            <PlusIcon className="size-4" />
            Novo item
          </Button>
        </div>
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
            <CardTitle className="text-2xl text-emerald-500">{formatCentsBRL(totalBoughtCents)}</CardTitle>
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
              {doneCount}/{items.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Itens comprados</CardContent>
        </Card>
      </div>

      {!activeShoppingProfileId ? (
        <p className="text-sm text-muted-foreground">Crie um perfil de compra pra começar.</p>
      ) : sortedItems.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum item cadastrado neste perfil ainda.</p>
      ) : (
        <ul className="space-y-2">
          {sortedItems.map((item) => (
            <li key={item.id} className="flex items-start gap-2">
              <Checkbox className="mt-0.5" checked={item.isDone} onCheckedChange={() => handleToggleItem(item)} />
              <div className="min-w-0 flex-1">
                <p className={cn('text-sm', item.isDone && 'text-muted-foreground line-through')}>{item.title}</p>
                {item.notes && <p className="text-xs text-muted-foreground">{item.notes}</p>}
              </div>
              <Badge className={urgencyBadgeClassNames[item.urgency]}>{urgencyLabels[item.urgency]}</Badge>
              {item.priceCents !== undefined && (
                <span className="text-sm font-medium whitespace-nowrap">{formatCentsBRL(item.priceCents)}</span>
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

      <ShoppingItemFormDialog
        item={editingItem}
        profileId={activeShoppingProfileId}
        open={itemFormOpen}
        onOpenChange={setItemFormOpen}
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
