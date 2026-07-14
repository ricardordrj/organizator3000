import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Task, TaskLink, TaskTag } from '@/models'
import { taskPersonSchema, taskPrioritySchema, taskStatusSchema, TASK_PEOPLE } from '@/models'
import { formatDateTime } from '@/utils/date.utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { DeadlineField } from './DeadlineField'
import { TagPicker } from './TagPicker'
import { LinksField } from './LinksField'
import { historyActionLabels, kindLabels, priorityLabels, statusLabels } from './taskLabels'

const NO_PERSON = 'none' as const

function personLabel(value: string) {
  return value === NO_PERSON ? 'Não atribuído' : value
}

const editFormSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  deadline: z.date().optional(),
  timeSpentHours: z.string(),
  description: z.string(),
  assignee: z.union([taskPersonSchema, z.literal(NO_PERSON)]),
  reporter: z.union([taskPersonSchema, z.literal(NO_PERSON)]),
  estimatedHours: z.string(),
  externalRef: z.string(),
})
type EditFormValues = z.infer<typeof editFormSchema>

function buildDefaultValues(task: Task): EditFormValues {
  return {
    title: task.title,
    status: task.status,
    priority: task.priority,
    deadline: task.deadline,
    timeSpentHours: task.timeSpentHours != null ? String(task.timeSpentHours) : '',
    description: task.kind === 'full' ? task.description : '',
    assignee: task.kind === 'full' ? (task.assignee ?? NO_PERSON) : NO_PERSON,
    reporter: task.kind === 'full' ? (task.reporter ?? NO_PERSON) : NO_PERSON,
    estimatedHours: task.kind === 'full' && task.estimatedHours != null ? String(task.estimatedHours) : '',
    externalRef: task.kind === 'full' ? (task.externalRef ?? '') : '',
  }
}

interface TaskDetailsDialogProps {
  task: Task | null
  onOpenChange: (open: boolean) => void
  onSave: (patch: Record<string, unknown>) => void
  onBlock: (reason: string) => void
  onUnblock: () => void
  onOpenComplete: () => void
}

export function TaskDetailsDialog({
  task,
  onOpenChange,
  onSave,
  onBlock,
  onUnblock,
  onOpenComplete,
}: TaskDetailsDialogProps) {
  const [blockReason, setBlockReason] = useState('')
  const [tags, setTags] = useState<TaskTag[]>([])
  const [links, setLinks] = useState<TaskLink[]>([])

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editFormSchema),
    defaultValues: task ? buildDefaultValues(task) : undefined,
  })

  useEffect(() => {
    if (task) {
      form.reset(buildDefaultValues(task))
      setBlockReason('')
      setTags(task.kind === 'full' ? task.tags : [])
      setLinks(task.kind === 'full' ? task.links : [])
    }
  }, [task, form])

  if (!task) return null

  function onSubmit(values: EditFormValues) {
    onSave({
      title: values.title,
      status: values.status,
      priority: values.priority,
      deadline: values.deadline,
      timeSpentHours: values.timeSpentHours ? Number(values.timeSpentHours) : undefined,
      description: values.description || undefined,
      assignee: values.assignee === NO_PERSON ? undefined : values.assignee,
      reporter: values.reporter === NO_PERSON ? undefined : values.reporter,
      estimatedHours: values.estimatedHours ? Number(values.estimatedHours) : undefined,
      externalRef: values.externalRef || undefined,
      tags,
      links,
    })
  }

  function handleBlock() {
    if (!blockReason.trim()) return
    onBlock(blockReason.trim())
    setBlockReason('')
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {task.title}
            <Badge variant="outline">{kindLabels[task.kind]}</Badge>
            {task.kind === 'full' && task.externalRef && (
              <Badge variant="outline">#{task.externalRef}</Badge>
            )}
            {task.isBlocked && <Badge variant="destructive">Bloqueada</Badge>}
          </DialogTitle>
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
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-2">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue>
                            {(value: EditFormValues['status']) => statusLabels[value]}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="in_progress">Em andamento</SelectItem>
                      </SelectContent>
                    </Select>
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
                            {(value: EditFormValues['priority']) => priorityLabels[value]}
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
            </div>

            <FormField
              control={form.control}
              name="timeSpentHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tempo executado (horas)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.5" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            {task.kind === 'full' && (
              <div className="grid grid-cols-2 gap-3 border-t pt-3">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
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
                        <Input type="number" min="0" step="0.5" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="externalRef"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nº do ticket (Azure/Jira)</FormLabel>
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={task.status === 'done' || task.isBlocked}
                onClick={onOpenComplete}
              >
                Concluir
              </Button>
              <Button type="submit">Salvar alterações</Button>
            </DialogFooter>
          </form>
        </Form>

        <div className="space-y-2 border-t pt-3">
          <h3 className="text-sm font-medium">Bloqueio</h3>
          {task.isBlocked ? (
            <div className="flex items-center justify-between gap-2 rounded-md bg-destructive/10 p-2 text-sm">
              <span>{task.blockHistory.at(-1)?.reason}</span>
              <Button type="button" variant="outline" size="sm" onClick={onUnblock}>
                Desbloquear
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Textarea
                placeholder="Motivo do bloqueio"
                value={blockReason}
                onChange={(event) => setBlockReason(event.target.value)}
                className="min-h-9"
              />
              <Button type="button" variant="outline" onClick={handleBlock}>
                Bloquear
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-2 border-t pt-3">
          <h3 className="text-sm font-medium">Histórico</h3>
          <ul className="max-h-48 space-y-1 overflow-y-auto text-sm text-muted-foreground">
            {[...task.history].reverse().map((entry) => (
              <li key={entry.id} className="flex justify-between gap-2">
                <span>
                  <span className="font-medium text-foreground">{historyActionLabels[entry.action]}:</span>{' '}
                  {entry.description}
                </span>
                <span className="shrink-0">{formatDateTime(entry.at)}</span>
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  )
}
