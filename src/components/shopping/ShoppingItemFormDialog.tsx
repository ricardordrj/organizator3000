import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import type { ShoppingItem } from '@/models'
import { shoppingUrgencySchema } from '@/models'
import { useShoppingItems } from '@/hooks'
import { ApiError } from '@/services/apiClient'
import { parseCurrencyInputToCents } from '@/utils/currency.utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { urgencyLabels } from './shoppingLabels'

const itemFormSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  notes: z.string().optional(),
  price: z.string().optional(),
  urgency: shoppingUrgencySchema,
})
type ItemFormValues = z.infer<typeof itemFormSchema>

function buildDefaultValues(item: ShoppingItem | null): ItemFormValues {
  if (!item) return { title: '', notes: '', price: '', urgency: 'media' }
  return {
    title: item.title,
    notes: item.notes ?? '',
    price: item.priceCents !== undefined ? (item.priceCents / 100).toFixed(2).replace('.', ',') : '',
    urgency: item.urgency,
  }
}

interface ShoppingItemFormDialogProps {
  item?: ShoppingItem | null
  profileId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShoppingItemFormDialog({ item, profileId, open, onOpenChange }: ShoppingItemFormDialogProps) {
  const { addShoppingItem, editShoppingItem } = useShoppingItems()
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: buildDefaultValues(item ?? null),
  })

  useEffect(() => {
    if (!open) return
    form.reset(buildDefaultValues(item ?? null))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item])

  async function onSubmit(values: ItemFormValues) {
    let priceCents: number | undefined
    if (values.price?.trim()) {
      priceCents = parseCurrencyInputToCents(values.price)
      if (priceCents === undefined || priceCents <= 0) {
        form.setError('price', { message: 'Valor inválido' })
        return
      }
    }

    setSubmitting(true)
    try {
      if (item) {
        await editShoppingItem(item.id, {
          title: values.title,
          notes: values.notes?.trim() ? values.notes.trim() : null,
          priceCents: priceCents ?? null,
          urgency: values.urgency,
        })
        toast.success('Item atualizado com sucesso')
      } else {
        if (!profileId) {
          toast.error('Selecione um perfil antes de criar o item')
          return
        }
        await addShoppingItem({
          profileId,
          title: values.title,
          notes: values.notes?.trim() ? values.notes.trim() : undefined,
          priceCents,
          urgency: values.urgency,
        })
        toast.success('Item criado com sucesso')
      }
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao salvar o item')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{item ? 'Editar item' : 'Novo item'}</DialogTitle>
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
                    <Input placeholder="Ex: Furadeira, jogo de panelas" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor estimado (R$, opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="0,00" inputMode="decimal" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="urgency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Urgência</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue>{(value: ItemFormValues['urgency']) => urgencyLabels[value]}</SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(urgencyLabels).map(([value, label]) => (
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
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Detalhes adicionais" {...field} />
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
                {item ? 'Salvar alterações' : 'Criar item'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
