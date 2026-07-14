import type { ChangeEvent } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ptBR as ptBRCalendar } from 'react-day-picker/locale'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface DeadlineFieldProps {
  value: Date | undefined
  onChange: (date: Date | undefined) => void
  placeholder?: string
}

export function DeadlineField({ value, onChange, placeholder = 'Selecionar prazo' }: DeadlineFieldProps) {
  const timeValue = value ? format(value, 'HH:mm') : '00:00'

  function handleDateSelect(date: Date | undefined) {
    if (!date) {
      onChange(undefined)
      return
    }
    const [hours, minutes] = timeValue.split(':').map(Number)
    const next = new Date(date)
    next.setHours(hours, minutes, 0, 0)
    onChange(next)
  }

  function handleTimeChange(event: ChangeEvent<HTMLInputElement>) {
    if (!value || !event.target.value) return
    const [hours, minutes] = event.target.value.split(':').map(Number)
    const next = new Date(value)
    next.setHours(hours, minutes, 0, 0)
    onChange(next)
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className={cn('w-full justify-start gap-2 font-normal', !value && 'text-muted-foreground')}
          />
        }
      >
        <CalendarIcon className="size-4" />
        {value ? format(value, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : placeholder}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={value} onSelect={handleDateSelect} locale={ptBRCalendar} />
        <div className="flex items-center gap-2 border-t p-2">
          <Input
            type="time"
            value={timeValue}
            onChange={handleTimeChange}
            disabled={!value}
            className="flex-1"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
