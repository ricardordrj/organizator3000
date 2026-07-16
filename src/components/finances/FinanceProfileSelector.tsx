import { useState } from 'react'
import { UsersIcon } from 'lucide-react'
import { useFinanceProfiles } from '@/hooks'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FinanceProfileManagerDialog } from './FinanceProfileManagerDialog'

export function FinanceProfileSelector() {
  const { financeProfiles, activeFinanceProfileId, setActiveFinanceProfileId } = useFinanceProfiles()
  const [managerOpen, setManagerOpen] = useState(false)

  const profileNames = Object.fromEntries(financeProfiles.map((p) => [p.id, p.name]))

  return (
    <div className="flex items-center gap-2">
      <Select
        value={activeFinanceProfileId ?? undefined}
        onValueChange={(value) => setActiveFinanceProfileId(value)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Selecione um perfil">
            {(value: string) => profileNames[value] ?? value}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {financeProfiles.map((profile) => (
            <SelectItem key={profile.id} value={profile.id}>
              {profile.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        type="button"
        variant="outline"
        size="icon"
        title="Gerenciar perfis"
        onClick={() => setManagerOpen(true)}
      >
        <UsersIcon className="size-4" />
      </Button>
      <FinanceProfileManagerDialog open={managerOpen} onOpenChange={setManagerOpen} />
    </div>
  )
}
