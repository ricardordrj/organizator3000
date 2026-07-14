import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTasks } from '@/hooks'
import { taskKindSchema, taskPersonSchema, taskPrioritySchema, TASK_PEOPLE } from '@/models'
import type { TaskLink, TaskTag } from '@/models'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { DeadlineField } from './DeadlineField'
import { TagPicker } from './TagPicker'
import { LinksField } from './LinksField'
import { kindLabels, priorityLabels } from './taskLabels'

const NO_PERSON = 'none' as const

function personLabel(value: string) {
  return value === NO_PERSON ? 'Não atribuído' : value
}

const taskFormSchema = z.object({
  kind: taskKindSchema,
  title: z.string().min(1, 'Título é obrigatório'),
  priority: taskPrioritySchema,
  deadline: z.date().optional(),
  description: z.string(),
  assignee: z.union([taskPersonSchema, z.literal(NO_PERSON)]),
  reporter: z.union([taskPersonSchema, z.literal(NO_PERSON)]),
  estimatedHours: z.string(),
  externalRef: z.string(),
})
type TaskFormValues = z.infer<typeof taskFormSchema>

const defaultValues: TaskFormValues = {
  kind: 'simple',
  title: '',
  priority: 'medium',
  deadline: undefined,
  description: '',
  assignee: NO_PERSON,
  reporter: NO_PERSON,
  estimatedHours: '',
  externalRef: '',
}

export function CreateTaskForm() {
  const { addTask } = useTasks()
  const [tags, setTags] = useState<TaskTag[]>([])
  const [links, setLinks] = useState<TaskLink[]>([])

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues,
  })

  const kind = form.watch('kind')

  function onSubmit(values: TaskFormValues) {
    if (values.kind === 'simple') {
      addTask({ kind: 'simple', title: values.title, priority: values.priority, deadline: values.deadline })
    } else {
      addTask({
        kind: 'full',
        title: values.title,
        priority: values.priority,
        deadline: values.deadline,
        description: values.description || undefined,
        assignee: values.assignee === NO_PERSON ? undefined : values.assignee,
        reporter: values.reporter === NO_PERSON ? undefined : values.reporter,
        estimatedHours: values.estimatedHours ? Number(values.estimatedHours) : undefined,
        externalRef: values.externalRef || undefined,
        tags,
        links,
      })
    }

    form.reset({ ...defaultValues, kind: values.kind })
    setTags([])
    setLinks([])
  }

  return (
    <Card>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-[140px_1fr_140px_240px_auto] items-end gap-2">
              <FormField
                control={form.control}
                name="kind"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue>
                            {(value: TaskFormValues['kind']) => kindLabels[value]}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="simple">Simples</SelectItem>
                        <SelectItem value="full">Completa</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Título da tarefa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridade</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue>
                            {(value: TaskFormValues['priority']) => priorityLabels[value]}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prazo limite</FormLabel>
                    <FormControl>
                      <DeadlineField value={field.value} onChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit">Adicionar</Button>
            </div>

            {kind === 'full' && (
              <div className="grid grid-cols-2 gap-3 border-t pt-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Detalhes da tarefa" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="assignee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsável (dev)</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue>{personLabel}</SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={NO_PERSON}>Não atribuído</SelectItem>
                          {TASK_PEOPLE.map((person) => (
                            <SelectItem key={person} value={person}>
                              {person}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reporter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aberto por (PO)</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue>{personLabel}</SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={NO_PERSON}>Não atribuído</SelectItem>
                          {TASK_PEOPLE.map((person) => (
                            <SelectItem key={person} value={person}>
                              {person}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="estimatedHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimativa (horas)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.5" placeholder="2" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="externalRef"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nº do ticket (Azure/Jira, opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="AB#1234" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="col-span-2 space-y-1.5">
                  <Label>Tags</Label>
                  <TagPicker value={tags} onChange={setTags} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Links úteis</Label>
                  <LinksField value={links} onChange={setLinks} />
                </div>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
