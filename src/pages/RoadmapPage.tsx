import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { CircleIcon, SquareCheckIcon, SquareIcon } from 'lucide-react'
import roadmapRaw from '../../ROADMAP.md?raw'
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
        <code key={key++} className="rounded bg-muted px-1 py-0.5 text-xs">
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
        <span className={cn(item.checked && 'text-muted-foreground line-through')}>
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

export function RoadmapPage() {
  const doc = useMemo(() => parseRoadmap(roadmapRaw), [])

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">{doc.title || 'Roadmap'}</h2>
        {doc.intro && <p className="mt-1 text-sm text-muted-foreground">{doc.intro}</p>}
      </div>

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
    </section>
  )
}
