import type { ReactNode } from 'react'

function renderInline(text: string): ReactNode[] {
  const parts: ReactNode[] = []
  const regex = /\*\*([^*]+)\*\*|`([^`]+)`|\[\[([^\]]+)\]\]/g
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
    } else if (match[3] !== undefined) {
      parts.push(
        <span key={key++} className="font-medium text-primary italic">
          {match[3]}
        </span>,
      )
    }
    lastIndex = regex.lastIndex
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex))
  return parts
}

interface Block {
  type: 'heading' | 'list' | 'quote' | 'paragraph'
  lines: string[]
}

function parseBlocks(content: string): Block[] {
  const blocks: Block[] = []
  const lines = content.split('\n')

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue

    if (line.startsWith('#')) {
      blocks.push({ type: 'heading', lines: [line.replace(/^#+\s*/, '')] })
    } else if (line.startsWith('- ')) {
      const last = blocks[blocks.length - 1]
      if (last?.type === 'list') last.lines.push(line.slice(2))
      else blocks.push({ type: 'list', lines: [line.slice(2)] })
    } else if (line.startsWith('> ')) {
      const last = blocks[blocks.length - 1]
      if (last?.type === 'quote') last.lines.push(line.slice(2))
      else blocks.push({ type: 'quote', lines: [line.slice(2)] })
    } else {
      const last = blocks[blocks.length - 1]
      if (last?.type === 'paragraph') last.lines.push(line)
      else blocks.push({ type: 'paragraph', lines: [line] })
    }
  }
  return blocks
}

export function LoreContent({ content }: { content: string }) {
  const blocks = parseBlocks(content)

  return (
    <div className="space-y-3 text-sm leading-relaxed">
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          return (
            <h4 key={index} className="font-heading text-sm font-semibold tracking-wide text-accent-foreground">
              {renderInline(block.lines[0])}
            </h4>
          )
        }
        if (block.type === 'list') {
          return (
            <ul key={index} className="ml-4 list-disc space-y-1 marker:text-primary">
              {block.lines.map((line, i) => (
                <li key={i}>{renderInline(line)}</li>
              ))}
            </ul>
          )
        }
        if (block.type === 'quote') {
          return (
            <blockquote key={index} className="border-l-2 border-ember pl-3 text-muted-foreground italic">
              {block.lines.map((line, i) => (
                <p key={i}>{renderInline(line)}</p>
              ))}
            </blockquote>
          )
        }
        return (
          <p key={index}>
            {block.lines.map((line, i) => (
              <span key={i}>
                {i > 0 && ' '}
                {renderInline(line)}
              </span>
            ))}
          </p>
        )
      })}
    </div>
  )
}
