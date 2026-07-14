import { useEffect, useState } from 'react'
import type { Task } from '@/models'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { DeadlineField } from './DeadlineField'

interface RescheduleDeadlineDialogProps {
  task: Task | null
  onOpenChange: (open: boolean) => void
  onConfirm: (newDeadline: Date, justification: string) => void
}

export function RescheduleDeadlineDialog({ task, onOpenChange, onConfirm }: RescheduleDeadlineDialogProps) {
  const [deadline, setDeadline] = useState<Date | undefined>(task?.deadline)
  const [justification, setJustification] = useState('')

  useEffect(() => {
    setDeadline(task?.deadline)
    setJustification('')
  }, [task])

  if (!task) return null

  const canConfirm = Boolean(deadline) && justification.trim().length > 0

  function handleConfirm() {
    if (!deadline || !canConfirm) return
    onConfirm(deadline, justification.trim())
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adiar prazo — {task.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Novo prazo</p>
            <DeadlineField value={deadline} onChange={setDeadline} />
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Justificativa (obrigatório)</p>
            <Textarea
              placeholder="Explique o motivo do adiamento"
              value={justification}
              onChange={(event) => setJustification(event.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" disabled={!canConfirm} onClick={handleConfirm}>
            Confirmar novo prazo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
