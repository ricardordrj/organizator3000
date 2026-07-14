import { useTheme } from '@/hooks'
import type { Theme } from '@/models'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

const themeLabels: Record<Theme, string> = {
  system: 'Sistema',
  light: 'Claro',
  dark: 'Escuro',
}

export function SettingsPage() {
  const { theme, setTheme } = useTheme()

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Configurações</h2>
      <div className="flex max-w-60 flex-col gap-2">
        <Label htmlFor="theme-select">Tema</Label>
        <Select value={theme} onValueChange={(value) => setTheme(value as Theme)}>
          <SelectTrigger id="theme-select">
            <SelectValue>{(value: Theme) => themeLabels[value]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="system">Sistema</SelectItem>
            <SelectItem value="light">Claro</SelectItem>
            <SelectItem value="dark">Escuro</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </section>
  )
}
