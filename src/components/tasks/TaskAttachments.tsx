import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { DownloadIcon, FileCodeIcon, ImageIcon, XIcon } from 'lucide-react'
import type { TaskAttachment } from '@/models'
import { attachmentService } from '@/services'
import { Button } from '@/components/ui/button'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

interface TaskAttachmentsProps {
  attachments: TaskAttachment[]
  onUpload?: (file: File) => void
  onRemove: (attachmentId: string) => void
}

export function TaskAttachments({ attachments, onUpload, onRemove }: TaskAttachmentsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [previewContent, setPreviewContent] = useState<{ content: string; truncated: boolean } | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) onUpload?.(file)
    event.target.value = ''
  }

  async function togglePreview(id: string) {
    if (previewId === id) {
      setPreviewId(null)
      setPreviewContent(null)
      return
    }
    setPreviewId(id)
    setPreviewContent(null)
    setPreviewLoading(true)
    try {
      const result = await attachmentService.preview(id)
      setPreviewContent(result)
    } finally {
      setPreviewLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      {onUpload && (
        <>
          <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            Adicionar anexo
          </Button>
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
        </>
      )}

      {attachments.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum anexo ainda.</p>
      ) : (
        <ul className="space-y-2">
          {attachments.map((attachment) => (
            <li key={attachment.id} className="rounded-md border p-2 text-sm">
              <div className="flex items-center gap-2">
                {attachment.kind === 'image' ? (
                  <ImageIcon className="size-4 shrink-0 text-muted-foreground" />
                ) : (
                  <FileCodeIcon className="size-4 shrink-0 text-muted-foreground" />
                )}
                <span className="flex-1 truncate">{attachment.fileName}</span>
                <span className="text-xs text-muted-foreground">{formatBytes(attachment.sizeBytes)}</span>
                {attachment.kind === 'code' && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePreview(attachment.id)}
                  >
                    {previewId === attachment.id ? 'Ocultar' : 'Ver conteúdo'}
                  </Button>
                )}
                <a
                  href={attachmentService.downloadUrl(attachment.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                  title="Baixar"
                >
                  <DownloadIcon className="size-4" />
                </a>
                <button
                  type="button"
                  onClick={() => onRemove(attachment.id)}
                  className="text-muted-foreground hover:text-destructive"
                  title="Remover"
                >
                  <XIcon className="size-4" />
                </button>
              </div>

              {attachment.kind === 'image' && (
                <img
                  src={attachmentService.downloadUrl(attachment.id)}
                  alt={attachment.fileName}
                  className="mt-2 max-h-40 rounded-md"
                />
              )}

              {previewId === attachment.id && (
                <div className="mt-2">
                  {previewLoading ? (
                    <p className="text-xs text-muted-foreground">Carregando...</p>
                  ) : (
                    <>
                      <pre className="max-h-64 overflow-auto rounded-md bg-muted p-2 text-xs">
                        {previewContent?.content}
                      </pre>
                      {previewContent?.truncated && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Conteúdo truncado (arquivo muito grande para exibir por completo).
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
