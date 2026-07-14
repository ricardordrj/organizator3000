import { TASK_TAGS } from '@/models'
import type { TaskTag } from '@/models'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface TagPickerProps {
  value: TaskTag[]
  onChange: (tags: TaskTag[]) => void
}

export function TagPicker({ value, onChange }: TagPickerProps) {
  function toggle(tag: TaskTag) {
    if (value.includes(tag)) onChange(value.filter((current) => current !== tag))
    else onChange([...value, tag])
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {TASK_TAGS.map((tag) => {
        const selected = value.includes(tag)
        return (
          <button key={tag} type="button" onClick={() => toggle(tag)}>
            <Badge
              variant={selected ? 'default' : 'outline'}
              className={cn('cursor-pointer select-none', !selected && 'text-muted-foreground')}
            >
              {tag}
            </Badge>
          </button>
        )
      })}
    </div>
  )
}
