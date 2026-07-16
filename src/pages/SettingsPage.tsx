import { useTheme } from '@/hooks'
import { useAppStore } from '@/store/useAppStore'
import type { Theme } from '@/models'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

const themeLabels: Record<Theme, string> = {
  system: 'Sistema',
  light: 'Claro',
  dark: 'Escuro',
}

function NotificationsSetting() {
  const notificationsEnabled = useAppStore((state) => state.notificationsEnabled)
  const setNotificationsEnabled = useAppStore((state) => state.setNotificationsEnabled)
  const isUnsupported = typeof Notification === 'undefined'
  const isDenied = !isUnsupported && Notification.permission === 'denied'

  return (
    <div className="flex max-w-80 flex-col gap-2">
      <div className="flex items-center gap-2">
        <Checkbox
          id="notifications-enabled"
          checked={notificationsEnabled}
          disabled={isUnsupported || isDenied}
          onCheckedChange={(checked) => setNotificationsEnabled(checked === true)}
        />
        <Label htmlFor="notifications-enabled">Notificar prazos próximos e atrasados</Label>
      </div>
      {isUnsupported && (
        <p className="text-xs text-muted-foreground">
          Seu navegador não suporta notificações.
        </p>
      )}
      {isDenied && (
        <p className="text-xs text-muted-foreground">
          Permissão de notificação bloqueada. Libere nas configurações do navegador pra ativar.
        </p>
      )}
    </div>
  )
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
      <NotificationsSetting />
    </section>
  )
}
