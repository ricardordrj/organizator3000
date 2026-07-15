import { useTags } from '@/hooks'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { resolveTagColorClass } from '@/lib/tagColors'

interface TagPickerProps {
  value: string[]
  onChange: (tagIds: string[]) => void
}

export function TagPicker({ value, onChange }: TagPickerProps) {
  const { tags } = useTags()

  function toggle(tagId: string) {
    if (value.includes(tagId)) onChange(value.filter((current) => current !== tagId))
    else onChange([...value, tagId])
  }

  if (tags.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma tag cadastrada ainda.</p>
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => {
        const selected = value.includes(tag.id)
        return (
          <button key={tag.id} type="button" onClick={() => toggle(tag.id)}>
            <Badge
              variant={selected ? undefined : 'outline'}
              className={cn(
                'cursor-pointer select-none',
                selected ? resolveTagColorClass(tag.color) : 'text-muted-foreground',
              )}
            >
              {tag.name}
            </Badge>
          </button>
        )
      })}
    </div>
  )
}
