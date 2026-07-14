import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNotes } from '@/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardAction, CardContent } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'

const noteFormSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  content: z.string(),
})
type NoteFormValues = z.infer<typeof noteFormSchema>

export function NotesPage() {
  const { notes, addNote, removeNote } = useNotes()

  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: { title: '', content: '' },
  })

  function onSubmit(values: NoteFormValues) {
    addNote(values)
    form.reset({ title: '', content: '' })
  }

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Notas</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input placeholder="Título da nota" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input placeholder="Conteúdo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Adicionar</Button>
        </form>
      </Form>

      <div className="space-y-3">
        {notes.map((note) => (
          <Card key={note.id}>
            <CardHeader>
              <CardTitle>{note.title}</CardTitle>
              <CardAction>
                <Button variant="ghost" size="sm" onClick={() => removeNote(note.id)}>
                  Remover
                </Button>
              </CardAction>
            </CardHeader>
            {note.content && (
              <CardContent className="text-sm">{note.content}</CardContent>
            )}
          </Card>
        ))}
        {notes.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhuma nota criada ainda.</p>
        )}
      </div>
    </section>
  )
}
