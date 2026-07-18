import { useState } from 'react'
import { UsersIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TagManager } from '@/components/cadastros/TagManager'
import { PersonManager } from '@/components/cadastros/PersonManager'

const TABS = [
  { id: 'tags', label: 'Tags' },
  { id: 'devs', label: 'Devs' },
  { id: 'pos', label: 'POs' },
] as const

type TabId = (typeof TABS)[number]['id']

export function CadastrosPage() {
  const [tab, setTab] = useState<TabId>('tags')

  return (
    <section className="space-y-6">
      <h2 className="flex items-center gap-2 text-xl font-semibold">
        <UsersIcon className="size-5 text-primary" />
        Cadastros
      </h2>

      <nav className="flex flex-wrap gap-1 border-b pb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm transition-colors',
              tab === t.id
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'tags' && <TagManager />}
      {tab === 'devs' && <PersonManager role="dev" roleLabel="Devs" />}
      {tab === 'pos' && <PersonManager role="po" roleLabel="POs" />}
    </section>
  )
}
