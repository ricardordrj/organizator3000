import { useState } from 'react'
import { ListIcon } from 'lucide-react'
import { useShoppingProfiles } from '@/hooks'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ShoppingProfileManagerDialog } from './ShoppingProfileManagerDialog'

export function ShoppingProfileSelector() {
  const { shoppingProfiles, activeShoppingProfileId, setActiveShoppingProfileId } = useShoppingProfiles()
  const [managerOpen, setManagerOpen] = useState(false)

  const profileNames = Object.fromEntries(shoppingProfiles.map((p) => [p.id, p.name]))

  return (
    <div className="flex items-center gap-2">
      <Select
        value={activeShoppingProfileId ?? undefined}
        onValueChange={(value) => setActiveShoppingProfileId(value)}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Selecione um perfil">
            {(value: string) => profileNames[value] ?? value}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {shoppingProfiles.map((profile) => (
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
        <ListIcon className="size-4" />
      </Button>
      <ShoppingProfileManagerDialog open={managerOpen} onOpenChange={setManagerOpen} />
    </div>
  )
}
