import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { CircleIcon, SquareCheckIcon, SquareIcon } from 'lucide-react'
import roadmapRaw from '../../../ROADMAP.md?raw'
import { parseRoadmap } from '@/lib/roadmap'
import type { RoadmapItem } from '@/lib/roadmap'
import { cn } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

function renderInline(text: string): ReactNode[] {
  const parts: ReactNode[] = []
  const regex = /\*\*([^*]+)\*\*|`([^`]+)`/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = regex.exec(text))) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index))
    if (match[1] !== undefined) {
      parts.push(<strong key={key++}>{match[1]}</strong>)
    } else if (match[2] !== undefined) {
      parts.push(
        <code key={key++} className="rounded bg-muted px-1 py-0.5 text-xs break-words">
          {match[2]}
        </code>,
      )
    }
    lastIndex = regex.lastIndex
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex))
  return parts
}

function RoadmapItemRow({ item }: { item: RoadmapItem }) {
  return (
    <li>
      <div className="flex items-start gap-2">
        {item.checked === undefined ? (
          <CircleIcon className="mt-1.5 size-1.5 shrink-0 fill-current text-muted-foreground" />
        ) : item.checked ? (
          <SquareCheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
        ) : (
          <SquareIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        )}
        <span className={cn('min-w-0 break-words', item.checked && 'text-muted-foreground line-through')}>
          {renderInline(item.text)}
        </span>
      </div>
      {item.children.length > 0 && (
        <ul className="mt-1 ml-6 space-y-1">
          {item.children.map((child, index) => (
            <RoadmapItemRow key={index} item={child} />
          ))}
        </ul>
      )}
    </li>
  )
}

export function RoadmapSection() {
  const doc = useMemo(() => parseRoadmap(roadmapRaw), [])

  return (
    <div className="space-y-4">
      {doc.intro && <p className="text-sm text-muted-foreground">{doc.intro}</p>}

      {doc.sections.map((section) => (
        <Card key={section.title}>
          <CardHeader>
            <CardTitle className="text-base">{section.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {section.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nada por aqui ainda.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {section.items.map((item, index) => (
                  <RoadmapItemRow key={index} item={item} />
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
