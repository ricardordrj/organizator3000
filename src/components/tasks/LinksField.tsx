import { useState } from 'react'
import { LinkIcon, XIcon } from 'lucide-react'
import { generateId } from '@/utils/id.utils'
import type { TaskLink } from '@/models'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface LinksFieldProps {
  value: TaskLink[]
  onChange: (links: TaskLink[]) => void
}

export function LinksField({ value, onChange }: LinksFieldProps) {
  const [label, setLabel] = useState('')
  const [url, setUrl] = useState('')

  function handleAdd() {
    if (!url.trim()) return
    onChange([...value, { id: generateId(), label: label.trim() || undefined, url: url.trim() }])
    setLabel('')
    setUrl('')
  }

  function handleRemove(id: string) {
    onChange(value.filter((link) => link.id !== id))
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="Nome (opcional)"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          className="w-40"
        />
        <Input
          placeholder="https://..."
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          className="flex-1"
        />
        <Button type="button" variant="outline" onClick={handleAdd}>
          Adicionar link
        </Button>
      </div>
      {value.length > 0 && (
        <ul className="space-y-1">
          {value.map((link) => (
            <li key={link.id} className="flex items-center gap-2 text-sm">
              <LinkIcon className="size-3.5 shrink-0 text-muted-foreground" />
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="flex-1 truncate text-primary hover:underline"
              >
                {link.label || link.url}
              </a>
              <button
                type="button"
                onClick={() => handleRemove(link.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <XIcon className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
