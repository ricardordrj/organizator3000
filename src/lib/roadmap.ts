export interface RoadmapItem {
  text: string
  checked?: boolean
  children: RoadmapItem[]
}

export interface RoadmapSection {
  title: string
  items: RoadmapItem[]
}

export interface RoadmapDoc {
  title: string
  intro: string
  sections: RoadmapSection[]
}

/** Parser minimalista para a estrutura do ROADMAP.md (h1, intro, h2 + listas/checklists aninhadas). */
export function parseRoadmap(markdown: string): RoadmapDoc {
  const lines = markdown.split('\n')
  let title = ''
  const intro: string[] = []
  const sections: RoadmapSection[] = []
  let current: RoadmapSection | null = null
  const stack: { indent: number; children: RoadmapItem[] }[] = []

  function childrenAt(indent: number): RoadmapItem[] {
    while (stack.length > 0 && stack[stack.length - 1].indent >= indent) stack.pop()
    if (stack.length === 0) return current ? current.items : []
    return stack[stack.length - 1].children
  }

  for (const raw of lines) {
    const h1 = raw.match(/^#\s+(.+)/)
    if (h1) {
      title = h1[1]
      continue
    }
    const h2 = raw.match(/^##\s+(.+)/)
    if (h2) {
      current = { title: h2[1], items: [] }
      sections.push(current)
      stack.length = 0
      continue
    }
    const checklist = raw.match(/^(\s*)-\s\[( |x)\]\s(.+)/)
    if (checklist) {
      const indent = checklist[1].length
      const item: RoadmapItem = { text: checklist[3], checked: checklist[2] === 'x', children: [] }
      childrenAt(indent).push(item)
      stack.push({ indent, children: item.children })
      continue
    }
    const bullet = raw.match(/^(\s*)-\s(.+)/)
    if (bullet) {
      const indent = bullet[1].length
      const item: RoadmapItem = { text: bullet[2], children: [] }
      childrenAt(indent).push(item)
      stack.push({ indent, children: item.children })
      continue
    }
    if (!current && raw.trim()) intro.push(raw.trim())
  }

  return { title, intro: intro.join(' '), sections }
}
