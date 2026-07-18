import { LogOutIcon, UserIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { useAppContext } from '@/context'

// Logout do Cloudflare Access: o edge da Cloudflare intercepta essa rota,
// limpa a sessão e mostra a tela de "você saiu". Caminho relativo pra valer
// pro domínio que estiver servindo o app.
const LOGOUT_URL = '/cdn-cgi/access/logout'

export function UserMenu() {
  const { user } = useAppContext()
  if (!user) return null

  return (
    <Popover>
      <PopoverTrigger
        render={<Button variant="ghost" size="icon" aria-label="Conta" title={user.email} />}
      >
        <UserIcon className="size-4" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64">
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-[0.625rem] tracking-widest text-muted-foreground uppercase">
            {user.role === 'admin' ? 'Admin' : 'Mesão'}
          </span>
          <span className="truncate text-sm font-medium">{user.email}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-center"
          onClick={() => window.location.assign(LOGOUT_URL)}
        >
          <LogOutIcon className="size-3.5" />
          Sair
        </Button>
      </PopoverContent>
    </Popover>
  )
}
