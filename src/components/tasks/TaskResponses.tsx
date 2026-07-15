import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTasks } from '@/hooks'
import type { TaskResponse } from '@/models'
import { ApiError } from '@/services/apiClient'
import { formatDateTime } from '@/utils/date.utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { TaskAttachments } from './TaskAttachments'
import { StagedAttachmentsField } from './StagedAttachmentsField'

const responseFormSchema = z.object({
  message: z.string().min(1, 'Mensagem é obrigatória'),
})
type ResponseFormValues = z.infer<typeof responseFormSchema>

interface TaskResponsesProps {
  taskId: string
  responses: TaskResponse[]
}

export function TaskResponses({ taskId, responses }: TaskResponsesProps) {
  const { addResponse, removeResponse, uploadAttachment, removeAttachment } = useTasks()
  const [stagedFiles, setStagedFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<TaskResponse | null>(null)

  const form = useForm<ResponseFormValues>({
    resolver: zodResolver(responseFormSchema),
    defaultValues: { message: '' },
  })

  async function onSubmit(values: ResponseFormValues) {
    setSubmitting(true)
    try {
      const response = await addResponse(taskId, values.message)
      for (const file of stagedFiles) {
        await uploadAttachment(taskId, file, response.id)
      }
      form.reset({ message: '' })
      setStagedFiles([])
      toast.success('Resposta registrada com sucesso')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao registrar a resposta')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await removeResponse(taskId, deleteTarget.id)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao excluir a resposta')
    } finally {
      setDeleteTarget(null)
    }
  }

  async function handleRemoveAttachment(attachmentId: string) {
    try {
      await removeAttachment(taskId, attachmentId)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao remover o anexo')
    }
  }

  return (
    <div className="space-y-4">
      {responses.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma resposta registrada ainda.</p>
      ) : (
        <ul className="space-y-3">
          {responses.map((response) => (
            <li key={response.id} className="space-y-2 rounded-md border p-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <p className="whitespace-pre-wrap">{response.message}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0"
                  onClick={() => setDeleteTarget(response)}
                >
                  Excluir
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">{formatDateTime(response.createdAt)}</p>
              {response.attachments.length > 0 && (
                <TaskAttachments
                  attachments={response.attachments}
                  onRemove={handleRemoveAttachment}
                />
              )}
            </li>
          ))}
        </ul>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 border-t pt-3">
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nova resposta</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descreva o resultado, cole o código ou explique o que foi feito"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <StagedAttachmentsField value={stagedFiles} onChange={setStagedFiles} />
          <div className="flex justify-end">
            <Button type="submit" disabled={submitting}>
              Responder
            </Button>
          </div>
        </form>
      </Form>

      <ConfirmDialog
        open={deleteTarget != null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Excluir resposta"
        description="Tem certeza que deseja excluir esta resposta e seus anexos?"
        confirmLabel="Excluir"
        onConfirm={handleDelete}
      />
    </div>
  )
}
