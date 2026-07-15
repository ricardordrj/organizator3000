import { useRef } from 'react'
import type { ChangeEvent } from 'react'
import { FileCodeIcon, ImageIcon, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

interface StagedAttachmentsFieldProps {
  value: File[]
  onChange: (files: File[]) => void
}

export function StagedAttachmentsField({ value, onChange }: StagedAttachmentsFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) onChange([...value, file])
    event.target.value = ''
  }

  function handleRemove(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-2">
      <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
        Adicionar anexo
      </Button>
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />

      {value.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum anexo selecionado.</p>
      ) : (
        <ul className="space-y-2">
          {value.map((file, index) => (
            <li key={`${file.name}-${index}`} className="flex items-center gap-2 rounded-md border p-2 text-sm">
              {file.type.startsWith('image/') ? (
                <ImageIcon className="size-4 shrink-0 text-muted-foreground" />
              ) : (
                <FileCodeIcon className="size-4 shrink-0 text-muted-foreground" />
              )}
              <span className="flex-1 truncate">{file.name}</span>
              <span className="text-xs text-muted-foreground">{formatBytes(file.size)}</span>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="text-muted-foreground hover:text-destructive"
                title="Remover"
              >
                <XIcon className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
