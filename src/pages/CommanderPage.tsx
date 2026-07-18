import { useEffect, useState } from 'react'
import { SwordsIcon, FlagIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useCommanderGame, useMyCommanderPlayerId } from '@/hooks'
import { commanderGameService } from '@/services'
import type { CommanderGamePlayer } from '@/models'
import { ApiError } from '@/services/apiClient'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { PlayerRoster } from '@/components/commander/PlayerRoster'
import { StartGameDialog } from '@/components/commander/StartGameDialog'
import { MyIdentityPicker } from '@/components/commander/MyIdentityPicker'
import { PlayerCard } from '@/components/commander/PlayerCard'
import { SendDamageDialog } from '@/components/commander/SendDamageDialog'
import { PlayerDetailDialog } from '@/components/commander/PlayerDetailDialog'

const ACTIVE_GAME_KEY = 'commander:active-game-id'

export function CommanderPage() {
  const [activeGameId, setActiveGameIdState] = useState<string | null>(() => localStorage.getItem(ACTIVE_GAME_KEY))
  const [checkingForActiveGame, setCheckingForActiveGame] = useState(false)
  const [startDialogOpen, setStartDialogOpen] = useState(false)
  const [endConfirmOpen, setEndConfirmOpen] = useState(false)
  const [damageTarget, setDamageTarget] = useState<CommanderGamePlayer | null>(null)
  const [detailPlayer, setDetailPlayer] = useState<CommanderGamePlayer | null>(null)

  const { myPlayerId } = useMyCommanderPlayerId()
  const { game, sendDamageRequest, resolveDamageRequest, endGame } = useCommanderGame(activeGameId)

  function setActiveGameId(id: string | null) {
    if (id) localStorage.setItem(ACTIVE_GAME_KEY, id)
    else localStorage.removeItem(ACTIVE_GAME_KEY)
    setActiveGameIdState(id)
  }

  // Se ninguém salvou um mesão nesse celular ainda, procura um em andamento (outro amigo pode ter começado).
  useEffect(() => {
    if (activeGameId) return
    setCheckingForActiveGame(true)
    commanderGameService
      .list('active')
      .then((games) => {
        if (games[0]) setActiveGameId(games[0].id)
      })
      .finally(() => setCheckingForActiveGame(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (game && game.status === 'ended') {
      setActiveGameId(null)
    }
  }, [game])

  async function handleSelfAdjust(delta: number) {
    if (!myPlayerId) return
    try {
      await sendDamageRequest({ fromPlayerId: myPlayerId, toPlayerId: myPlayerId, amount: delta, type: 'life_adjust' })
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao ajustar vida')
    }
  }

  async function handleResolveRequest(requestId: string, action: 'apply' | 'dismiss') {
    try {
      await resolveDamageRequest(requestId, { action })
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao resolver solicitação')
    }
  }

  async function handleEndGame() {
    try {
      await endGame()
      setActiveGameId(null)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao encerrar o mesão')
    } finally {
      setEndConfirmOpen(false)
    }
  }

  const myPlayer = game?.players.find((p) => p.playerId === myPlayerId)
  const sortedPlayers = game
    ? [...game.players].sort((a, b) => (a.playerId === myPlayerId ? -1 : b.playerId === myPlayerId ? 1 : 0))
    : []

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <SwordsIcon className="size-5 text-primary" />
          Mesão de Commander
        </h2>
        <MyIdentityPicker />
      </div>

      {!activeGameId ? (
        <div className="space-y-6">
          <PlayerRoster />
          <Button onClick={() => setStartDialogOpen(true)} disabled={checkingForActiveGame}>
            <SwordsIcon className="size-4" />
            Iniciar mesão
          </Button>
          <StartGameDialog open={startDialogOpen} onOpenChange={setStartDialogOpen} onStarted={setActiveGameId} />
        </div>
      ) : !game ? (
        <p className="text-sm text-muted-foreground">Carregando mesão...</p>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {sortedPlayers.map((player) => (
              <PlayerCard
                key={player.playerId}
                player={player}
                isYou={player.playerId === myPlayerId}
                pendingRequests={game.pendingRequests.filter((r) => r.toPlayerId === player.playerId)}
                onSelfAdjust={handleSelfAdjust}
                onResolveRequest={handleResolveRequest}
                onOpenDetail={() => setDetailPlayer(player)}
                onSendDamage={() => setDamageTarget(player)}
                canSendDamage={myPlayerId != null}
              />
            ))}
          </div>

          {!myPlayerId && (
            <p className="text-sm text-muted-foreground">
              Escolha "Eu sou..." lá em cima pra poder ajustar sua vida e mandar dano.
            </p>
          )}

          <Button variant="outline" size="sm" onClick={() => setEndConfirmOpen(true)}>
            <FlagIcon className="size-4" />
            Encerrar mesão
          </Button>
        </div>
      )}

      {myPlayer && damageTarget && (
        <SendDamageDialog
          open={damageTarget != null}
          onOpenChange={(open) => !open && setDamageTarget(null)}
          fromPlayerName={myPlayer.name}
          toPlayerName={damageTarget.name}
          onSend={async (input) => {
            await sendDamageRequest({ fromPlayerId: myPlayer.playerId, toPlayerId: damageTarget.playerId, ...input })
          }}
        />
      )}

      {game && (
        <PlayerDetailDialog
          open={detailPlayer != null}
          onOpenChange={(open) => !open && setDetailPlayer(null)}
          player={detailPlayer}
          otherPlayers={game.players.filter((p) => p.playerId !== detailPlayer?.playerId)}
          commanderDamage={game.commanderDamage}
          history={game.history}
        />
      )}

      <ConfirmDialog
        open={endConfirmOpen}
        onOpenChange={setEndConfirmOpen}
        title="Encerrar mesão"
        description="Isso finaliza a mesa pra todo mundo. Tem certeza?"
        confirmLabel="Encerrar"
        onConfirm={handleEndGame}
      />
    </div>
  )
}
