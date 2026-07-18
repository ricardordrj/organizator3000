import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  SkullIcon,
  FolderKanbanIcon,
  PlusIcon,
  ChevronDownIcon,
  ExternalLinkIcon,
  ImageIcon,
} from 'lucide-react'
import { useLoreCategories, useLoreEntries } from '@/hooks'
import type { LoreCategory, LoreCategoryKind, LoreEntry } from '@/models'
import { ApiError } from '@/services/apiClient'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { CategoryFormDialog } from '@/components/lore/CategoryFormDialog'
import { EntryFormDialog } from '@/components/lore/EntryFormDialog'
import { LoreContent } from '@/components/lore/LoreContent'

const kindTabs: { kind: LoreCategoryKind; label: string; icon: typeof SkullIcon }[] = [
  { kind: 'dark_fantasy', label: 'Dark Fantasy', icon: SkullIcon },
  { kind: 'personal_project', label: 'Projetos Pessoais', icon: FolderKanbanIcon },
]

export function ProjectsPage() {
  const { loreCategories, removeLoreCategory } = useLoreCategories()
  const { loreEntries, removeLoreEntry } = useLoreEntries()

  const [activeKind, setActiveKind] = useState<LoreCategoryKind>('dark_fantasy')
  const activeTab = kindTabs.find((tab) => tab.kind === activeKind)!

  const sortedCategories = useMemo(
    () =>
      loreCategories
        .filter((category) => category.kind === activeKind)
        .sort((a, b) => a.orderIndex - b.orderIndex),
    [loreCategories, activeKind],
  )

  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)
  const activeCategoryIdOrFirst = activeCategoryId ?? sortedCategories[0]?.id ?? null

  function switchKind(kind: LoreCategoryKind) {
    setActiveKind(kind)
    setActiveCategoryId(null)
  }

  const entriesInCategory = useMemo(
    () =>
      [...loreEntries]
        .filter((entry) => entry.categoryId === activeCategoryIdOrFirst)
        .sort((a, b) => a.orderIndex - b.orderIndex),
    [loreEntries, activeCategoryIdOrFirst],
  )

  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)

  const [categoryFormOpen, setCategoryFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<LoreCategory | null>(null)
  const [removeCategoryTarget, setRemoveCategoryTarget] = useState<LoreCategory | null>(null)

  const [entryFormOpen, setEntryFormOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<LoreEntry | null>(null)
  const [removeEntryTarget, setRemoveEntryTarget] = useState<LoreEntry | null>(null)

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function openCreateEntry() {
    setEditingEntry(null)
    setEntryFormOpen(true)
  }

  function openEditEntry(entry: LoreEntry) {
    setEditingEntry(entry)
    setEntryFormOpen(true)
  }

  async function handleRemoveCategory() {
    if (!removeCategoryTarget) return
    try {
      await removeLoreCategory(removeCategoryTarget.id)
      if (activeCategoryId === removeCategoryTarget.id) setActiveCategoryId(null)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao remover a categoria')
    } finally {
      setRemoveCategoryTarget(null)
    }
  }

  async function handleRemoveEntry() {
    if (!removeEntryTarget) return
    try {
      await removeLoreEntry(removeEntryTarget.id)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao remover a página')
    } finally {
      setRemoveEntryTarget(null)
    }
  }

  const activeCategory = sortedCategories.find((c) => c.id === activeCategoryIdOrFirst)

  return (
    <section className="space-y-4">
      <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {kindTabs.map((tab) => (
          <button
            key={tab.kind}
            type="button"
            onClick={() => switchKind(tab.kind)}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium tracking-wide whitespace-nowrap transition-colors',
              tab.kind === activeKind
                ? 'bg-gradient-to-r from-primary/25 to-accent/25 text-foreground ring-1 ring-primary/50'
                : 'bg-muted text-muted-foreground hover:text-foreground',
            )}
          >
            <tab.icon className="size-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <activeTab.icon className="size-5 text-primary" />
            {activeTab.label}
          </h2>
          {activeKind === 'dark_fantasy' && (
            <a
              href="https://github.com/ricardordrj/DarkFantasy"
              target="_blank"
              rel="noreferrer"
              className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              github.com/ricardordrj/DarkFantasy
              <ExternalLinkIcon className="size-3" />
            </a>
          )}
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEditingCategory(null)
            setCategoryFormOpen(true)
          }}
        >
          <PlusIcon className="size-4" />
          Nova categoria
        </Button>
      </div>

      {sortedCategories.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma categoria cadastrada ainda.</p>
      ) : (
        <>
          <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
            {sortedCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategoryId(category.id)}
                className={cn(
                  'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium tracking-wide whitespace-nowrap transition-colors',
                  category.id === activeCategoryIdOrFirst
                    ? 'bg-gradient-to-r from-primary/25 to-accent/25 text-foreground ring-1 ring-primary/50'
                    : 'bg-muted text-muted-foreground hover:text-foreground',
                )}
              >
                {category.title}
              </button>
            ))}
          </div>

          {activeCategory && (
            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingCategory(activeCategory)
                    setCategoryFormOpen(true)
                  }}
                >
                  Editar categoria
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setRemoveCategoryTarget(activeCategory)}>
                  Remover categoria
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={openCreateEntry}>
                <PlusIcon className="size-4" />
                Nova página
              </Button>
            </div>
          )}

          {entriesInCategory.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma página nessa categoria ainda.</p>
          ) : (
            <ul className="space-y-2">
              {entriesInCategory.map((entry) => {
                const isExpanded = expanded.has(entry.id)
                return (
                  <li key={entry.id}>
                    <Card className="gap-0 py-0">
                      <button
                        type="button"
                        onClick={() => toggleExpanded(entry.id)}
                        className="flex w-full items-center justify-between gap-2 p-3.5 text-left"
                      >
                        <span className="font-medium">{entry.title}</span>
                        <div className="flex items-center gap-2">
                          {entry.images.length > 0 && (
                            <Badge variant="outline" className="gap-1 text-[0.65rem]">
                              {entry.images.length}
                              <ImageIcon className="size-3" />
                            </Badge>
                          )}
                          <ChevronDownIcon
                            className={cn('size-4 shrink-0 text-muted-foreground transition-transform', isExpanded && 'rotate-180')}
                          />
                        </div>
                      </button>
                      {isExpanded && (
                        <CardContent className="space-y-3 border-t pt-3.5">
                          {entry.images.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto">
                              {entry.images.map((src) => (
                                <button
                                  key={src}
                                  type="button"
                                  onClick={() => setLightboxSrc(src)}
                                  className="shrink-0 cursor-zoom-in"
                                >
                                  <img
                                    src={src}
                                    alt={entry.title}
                                    className="h-40 w-auto rounded-lg object-cover ring-1 ring-primary/20 transition-opacity hover:opacity-80"
                                  />
                                </button>
                              ))}
                            </div>
                          )}
                          <LoreContent content={entry.content} />
                          <div className="flex justify-end gap-1 border-t pt-2">
                            <Button variant="ghost" size="sm" onClick={() => openEditEntry(entry)}>
                              Editar
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setRemoveEntryTarget(entry)}>
                              Remover
                            </Button>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  </li>
                )
              })}
            </ul>
          )}
        </>
      )}

      <CategoryFormDialog
        category={editingCategory}
        kind={activeKind}
        open={categoryFormOpen}
        onOpenChange={setCategoryFormOpen}
      />
      <EntryFormDialog
        entry={editingEntry}
        categoryId={activeCategoryIdOrFirst}
        open={entryFormOpen}
        onOpenChange={setEntryFormOpen}
      />

      <ConfirmDialog
        open={removeCategoryTarget != null}
        onOpenChange={(open) => {
          if (!open) setRemoveCategoryTarget(null)
        }}
        title="Remover categoria"
        description={`Tem certeza que deseja remover "${removeCategoryTarget?.title}"? Todas as páginas dessa categoria também serão removidas.`}
        confirmLabel="Remover"
        onConfirm={handleRemoveCategory}
      />
      <ConfirmDialog
        open={removeEntryTarget != null}
        onOpenChange={(open) => {
          if (!open) setRemoveEntryTarget(null)
        }}
        title="Remover página"
        description={`Tem certeza que deseja remover "${removeEntryTarget?.title}"?`}
        confirmLabel="Remover"
        onConfirm={handleRemoveEntry}
      />

      <Dialog
        open={lightboxSrc != null}
        onOpenChange={(open) => {
          if (!open) setLightboxSrc(null)
        }}
      >
        <DialogContent className="flex max-h-[90svh] max-w-[95vw] items-center justify-center border-none bg-transparent p-0 shadow-none ring-0 sm:max-w-3xl">
          {lightboxSrc && (
            <img src={lightboxSrc} alt="" className="max-h-[90svh] max-w-full rounded-lg object-contain" />
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
