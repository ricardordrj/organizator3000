import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import type { LoreCategory, LoreCategoryKind } from '@/models'
import { useLoreCategories } from '@/hooks'
import { ApiError } from '@/services/apiClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

const categoryFormSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
})
type CategoryFormValues = z.infer<typeof categoryFormSchema>

function buildDefaultValues(category: LoreCategory | null): CategoryFormValues {
  return { title: category?.title ?? '' }
}

interface CategoryFormDialogProps {
  category?: LoreCategory | null
  kind: LoreCategoryKind
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CategoryFormDialog({ category, kind, open, onOpenChange }: CategoryFormDialogProps) {
  const { addLoreCategory, editLoreCategory } = useLoreCategories()
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: buildDefaultValues(category ?? null),
  })

  useEffect(() => {
    if (!open) return
    form.reset(buildDefaultValues(category ?? null))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, category])

  async function onSubmit(values: CategoryFormValues) {
    setSubmitting(true)
    try {
      if (category) {
        await editLoreCategory(category.id, { title: values.title })
        toast.success('Categoria atualizada com sucesso')
      } else {
        await addLoreCategory({ title: values.title, kind })
        toast.success('Categoria criada com sucesso')
      }
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao salvar a categoria')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{category ? 'Editar categoria' : 'Nova categoria'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Criaturas" {...field} />
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
                {category ? 'Salvar alterações' : 'Criar categoria'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
