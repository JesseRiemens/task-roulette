import { useState, useRef, useEffect } from 'react'
import { Reorder, useDragControls } from 'framer-motion'
import { DotsSixVertical, PencilSimple, Check, X } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TaskItemProps {
  task: string
  index: number
  isSelected: boolean
  isSpinning: boolean
  onEdit: (index: number, value: string) => void
  onDelete: (index: number) => void
}

export function TaskItem({ task, index, isSelected, isSpinning, onEdit, onDelete }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(task)
  const itemRef = useRef<HTMLLIElement>(null)
  const controls = useDragControls()

  useEffect(() => {
    if (isSelected && isSpinning && itemRef.current) {
      itemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      })
    }
  }, [isSelected, isSpinning])

  const handleSave = () => {
    if (editValue.trim()) {
      onEdit(index, editValue.trim())
      setIsEditing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setEditValue(task)
      setIsEditing(false)
    }
  }

  return (
    <Reorder.Item
      value={task}
      dragListener={false}
      dragControls={controls}
      ref={itemRef}
      initial={{ opacity: 0, y: -10 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: isSelected && isSpinning ? 1.02 : 1
      }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{
        scale: { duration: 0.1 }
      }}
      className={cn(
        'group flex items-start gap-1.5 p-2 rounded-lg border bg-card hover:bg-card/80 transition-colors select-none',
        isSelected && isSpinning && 'bg-primary/20 border-primary/40 spin-highlight',
        isSelected && !isSpinning && 'ring-2 ring-accent shadow-lg shadow-accent/20'
      )}
    >
      <div
        className="cursor-grab active:cursor-grabbing p-0.5 hover:bg-primary/20 rounded flex-shrink-0"
        style={{ touchAction: 'none' }}
        onPointerDown={(e) => controls.start(e)}
      >
        <DotsSixVertical weight="bold" className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="flex-1 flex items-start gap-1.5 min-w-0">
        <span className="text-muted-foreground font-semibold text-xs w-5 flex-shrink-0 mt-0.5">{index + 1}</span>
        {isEditing ? (
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="flex-1 text-sm min-h-[2rem] max-h-[8rem] resize-none bg-background border border-input rounded-md px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            autoFocus
            rows={1}
            style={{
              height: 'auto',
              overflowY: editValue.split('\n').length > 3 ? 'auto' : 'hidden'
            }}
            ref={(el) => {
              if (el) {
                el.style.height = 'auto'
                el.style.height = el.scrollHeight + 'px'
              }
            }}
          />
        ) : (
          <span className="flex-1 break-words overflow-wrap-anywhere text-sm leading-snug" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{task}</span>
        )}
      </div>

      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        {isEditing ? (
          <Button
            variant="ghost"
            size="icon"
            onMouseDown={(e) => {
              e.preventDefault()
              handleSave()
            }}
            className="h-7 w-7 hover:bg-accent hover:text-accent-foreground"
          >
            <Check className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onMouseDown={(e) => {
              e.preventDefault()
              setIsEditing(true)
            }}
            className="h-7 w-7 hover:bg-primary/20"
          >
            <PencilSimple className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onMouseDown={(e) => {
            e.preventDefault()
            onDelete(index)
          }}
          className="h-7 w-7 hover:bg-destructive/20 hover:text-destructive"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </Reorder.Item>
  )
}
