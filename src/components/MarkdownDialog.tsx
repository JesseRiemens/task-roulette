import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { parseMarkdownSections } from '@/lib/markdown-sections'
import type { TaskSection } from '@/types/section'

interface MarkdownDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (sections: TaskSection[], mode: 'replace' | 'append') => void
}

export function MarkdownDialog({ open, onOpenChange, onImport }: MarkdownDialogProps) {
  const [text, setText] = useState('')
  const parsed = parseMarkdownSections(text)
  const taskCount = parsed.reduce((n, s) => n + s.tasks.length, 0)

  const apply = (mode: 'replace' | 'append') => {
    onImport(parsed, mode)
    toast.success(`Imported ${taskCount} tasks in ${parsed.length} section${parsed.length === 1 ? '' : 's'}`)
    setText('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Paste from LLM</DialogTitle>
          <DialogDescription>
            Paste Markdown: "## Section" headings with "- task" bullets. A plain list becomes one section.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={'## Chores\n- Dishes\n- Laundry'}
          className="min-h-[180px] font-mono text-sm"
          autoFocus
        />
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {taskCount === 0
            ? 'No tasks found yet'
            : `Found ${taskCount} tasks in ${parsed.length} section${parsed.length === 1 ? '' : 's'}: ${parsed.map((s) => s.name).join(', ')}`}
        </p>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" disabled={taskCount === 0} onClick={() => apply('append')}>
            Add to existing
          </Button>
          <Button disabled={taskCount === 0} onClick={() => apply('replace')}>
            Replace all
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
