import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import type { LoreEntry } from '@/models'
import { useLoreEntries } from '@/hooks'
import { ApiError } from '@/services/apiClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'

const entryFormSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  images: z.string().optional(),
})
type EntryFormValues = z.infer<typeof entryFormSchema>

function buildDefaultValues(entry: LoreEntry | null): EntryFormValues {
  if (!entry) return { title: '', content: '', images: '' }
  return {
    title: entry.title,
    content: entry.content,
    images: entry.images.join('\n'),
  }
}

function parseImages(value: string | undefined): string[] {
  if (!value) return []
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

interface EntryFormDialogProps {
  entry?: LoreEntry | null
  categoryId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EntryFormDialog({ entry, categoryId, open, onOpenChange }: EntryFormDialogProps) {
  const { addLoreEntry, editLoreEntry } = useLoreEntries()
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<EntryFormValues>({
    resolver: zodResolver(entryFormSchema),
    defaultValues: buildDefaultValues(entry ?? null),
  })

  useEffect(() => {
    if (!open) return
    form.reset(buildDefaultValues(entry ?? null))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, entry])

  async function onSubmit(values: EntryFormValues) {
    const images = parseImages(values.images)

    setSubmitting(true)
    try {
      if (entry) {
        await editLoreEntry(entry.id, { title: values.title, content: values.content, images })
        toast.success('Página atualizada com sucesso')
      } else {
        if (!categoryId) {
          toast.error('Selecione uma categoria antes de criar a página')
          return
        }
        await addLoreEntry({ categoryId, title: values.title, content: values.content, images })
        toast.success('Página criada com sucesso')
      }
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao salvar a página')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{entry ? 'Editar página' : 'Nova página'}</DialogTitle>
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
                    <Input placeholder="Ex: Kael" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conteúdo</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={'## Subtítulo\n- item de lista\n> citação\n[[termo]] para destacar um conceito'}
                      className="min-h-48 font-mono text-xs"
                      style={{ fieldSizing: 'fixed' }}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Aceita <code className="text-xs">## títulos</code>, <code className="text-xs">- listas</code>,{' '}
                    <code className="text-xs">&gt; citações</code>, <code className="text-xs">**negrito**</code> e{' '}
                    <code className="text-xs">[[termo]]</code> pra destacar conceitos.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imagens (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={'Uma URL por linha'}
                      className="min-h-16 font-mono text-xs"
                      style={{ fieldSizing: 'fixed' }}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Cole links de imagens (ex: do repositório no GitHub), uma por linha.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {entry ? 'Salvar alterações' : 'Criar página'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
