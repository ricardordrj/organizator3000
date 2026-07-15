import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import type { Task, TaskLink } from '@/models'
import { taskKindSchema, taskPrioritySchema, taskStatusSchema } from '@/models'
import { useTasks, usePeople } from '@/hooks'
import { ApiError } from '@/services/apiClient'
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
  FormMessage,
} from '@/components/ui/form'
import { DeadlineField } from './DeadlineField'
import { TagPicker } from './TagPicker'
import { LinksField } from './LinksField'
import { TaskAttachments } from './TaskAttachments'
import { StagedAttachmentsField } from './StagedAttachmentsField'
import { kindLabels, priorityLabels, statusLabels } from './taskLabels'

const NO_PERSON = 'none' as const

const taskFormSchema = z.object({
  kind: taskKindSchema,
  title: z.string().min(1, 'Título é obrigatório'),
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  deadline: z.date().optional(),
  timeSpentHours: z.string(),
  description: z.string(),
  assigneeId: z.string(),
  reporterId: z.string(),
  estimatedHours: z.string(),
  externalRef: z.string(),
})
type TaskFormValues = z.infer<typeof taskFormSchema>

function buildDefaultValues(task: Task | null): TaskFormValues {
  if (!task) {
    return {
      kind: 'simple',
      title: '',
      status: 'pending',
      priority: 'medium',
      deadline: undefined,
      timeSpentHours: '',
      description: '',
      assigneeId: NO_PERSON,
      reporterId: NO_PERSON,
      estimatedHours: '',
      externalRef: '',
    }
  }
  return {
    kind: task.kind,
    title: task.title,
    status: task.status,
    priority: task.priority,
    deadline: task.deadline,
    timeSpentHours: task.timeSpentHours != null ? String(task.timeSpentHours) : '',
    description: task.kind === 'full' ? task.description : '',
    assigneeId: task.kind === 'full' ? (task.assignee?.id ?? NO_PERSON) : NO_PERSON,
    reporterId: task.kind === 'full' ? (task.reporter?.id ?? NO_PERSON) : NO_PERSON,
    estimatedHours: task.kind === 'full' && task.estimatedHours != null ? String(task.estimatedHours) : '',
    externalRef: task.kind === 'full' ? (task.externalRef ?? '') : '',
  }
}

interface TaskFormDialogProps {
  mode: 'create' | 'edit'
  task?: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskFormDialog({ mode, task, open, onOpenChange }: TaskFormDialogProps) {
  const { addTask, editTask, uploadAttachment, removeAttachment } = useTasks()
  const { devs, pos } = usePeople()
  const [tagIds, setTagIds] = useState<string[]>([])
  const [links, setLinks] = useState<TaskLink[]>([])
  const [stagedFiles, setStagedFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: buildDefaultValues(mode === 'edit' ? (task ?? null) : null),
  })

  useEffect(() => {
    if (!open) return
    form.reset(buildDefaultValues(mode === 'edit' ? (task ?? null) : null))
    setTagIds(task?.kind === 'full' ? task.tags.map((t) => t.id) : [])
    setLinks(task?.kind === 'full' ? task.links : [])
    setStagedFiles([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, task, mode])

  const kind = form.watch('kind')
  const effectiveKind = mode === 'edit' ? task?.kind : kind

  if (mode === 'edit' && !task) return null

  async function handleUploadAttachment(file: File) {
    if (!task) return
    try {
      await uploadAttachment(task.id, file)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao enviar o anexo')
    }
  }

  async function handleRemoveAttachment(attachmentId: string) {
    if (!task) return
    try {
      await removeAttachment(task.id, attachmentId)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao remover o anexo')
    }
  }

  async function onSubmit(values: TaskFormValues) {
    setSubmitting(true)
    try {
      if (mode === 'create') {
        const input =
          values.kind === 'simple'
            ? { kind: 'simple' as const, title: values.title, priority: values.priority, deadline: values.deadline }
            : {
                kind: 'full' as const,
                title: values.title,
                priority: values.priority,
                deadline: values.deadline,
                description: values.description || undefined,
                assigneeId: values.assigneeId === NO_PERSON ? undefined : values.assigneeId,
                reporterId: values.reporterId === NO_PERSON ? undefined : values.reporterId,
                estimatedHours: values.estimatedHours ? Number(values.estimatedHours) : undefined,
                externalRef: values.externalRef || undefined,
                tagIds,
                links,
              }
        const created = await addTask(input)
        for (const file of stagedFiles) {
          await uploadAttachment(created.id, file)
        }
        onOpenChange(false)
        toast.success('Tarefa criada com sucesso')
      } else if (task) {
        await editTask(task.id, {
          title: values.title,
          status: values.status,
          priority: values.priority,
          deadline: values.deadline,
          timeSpentHours: values.timeSpentHours ? Number(values.timeSpentHours) : undefined,
          description: values.description || undefined,
          assigneeId: values.assigneeId === NO_PERSON ? undefined : values.assigneeId,
          reporterId: values.reporterId === NO_PERSON ? undefined : values.reporterId,
          estimatedHours: values.estimatedHours ? Number(values.estimatedHours) : undefined,
          externalRef: values.externalRef || undefined,
          tagIds,
          links,
        })
        toast.success('Tarefa atualizada com sucesso')
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao salvar a tarefa')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'create' ? 'Nova tarefa' : task?.title}
            {mode === 'edit' && task && <Badge variant="outline">{kindLabels[task.kind]}</Badge>}
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
                    <Input placeholder="Título da tarefa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {mode === 'create' ? (
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
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
                              {(value: TaskFormValues['status']) => statusLabels[value]}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="in_progress">Em andamento</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
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
                    <FormMessage />
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {mode === 'edit' && (
              <FormField
                control={form.control}
                name="timeSpentHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tempo executado (horas)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {effectiveKind === 'full' && (
              <div className="grid grid-cols-1 gap-3 border-t pt-3 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Detalhes da tarefa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="assigneeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsável (dev)</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue>
                              {(value: string) => devs.find((d) => d.id === value)?.name ?? 'Não atribuído'}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={NO_PERSON}>Não atribuído</SelectItem>
                          {devs.map((dev) => (
                            <SelectItem key={dev.id} value={dev.id}>
                              {dev.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reporterId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aberto por (PO)</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue>
                              {(value: string) => pos.find((p) => p.id === value)?.name ?? 'Não atribuído'}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={NO_PERSON}>Não atribuído</SelectItem>
                          {pos.map((po) => (
                            <SelectItem key={po.id} value={po.id}>
                              {po.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
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
                      <FormMessage />
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Tags</Label>
                  <TagPicker value={tagIds} onChange={setTagIds} />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Links úteis</Label>
                  <LinksField value={links} onChange={setLinks} />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Anexos</Label>
                  {mode === 'edit' && task ? (
                    <TaskAttachments
                      attachments={task.kind === 'full' ? task.attachments : []}
                      onUpload={handleUploadAttachment}
                      onRemove={handleRemoveAttachment}
                    />
                  ) : (
                    <StagedAttachmentsField value={stagedFiles} onChange={setStagedFiles} />
                  )}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {mode === 'create' ? 'Criar tarefa' : 'Salvar alterações'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
