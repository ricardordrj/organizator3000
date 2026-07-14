import type { Task } from '@/models'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

interface ConfirmCompleteDialogProps {
  task: Task | null
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function ConfirmCompleteDialog({ task, onOpenChange, onConfirm }: ConfirmCompleteDialogProps) {
  if (!task) return null

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Concluir tarefa</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja concluir "{task.title}"?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onConfirm}>Concluir</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
