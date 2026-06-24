import { useState } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { Plus, Sparkle, Trash } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TaskItem } from './TaskItem'
import type { TaskSection } from '@/types/section'

interface SectionCardProps {
  section: TaskSection
  selectedTask: number | null
  isSpinning: boolean
  isSectionSpinning: boolean
  onUpdateName: (name: string) => void
  onAddTask: (task: string) => void
  onEditTask: (index: number, value: string) => void
  onDeleteTask: (index: number) => void
  onReorderTasks: (newOrder: string[]) => void
  onDeleteSection: () => void
  onSpinSection: () => void
}

export function SectionCard({
  section,
  selectedTask,
  isSpinning,
  isSectionSpinning,
  onUpdateName,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onReorderTasks,
  onDeleteSection,
  onSpinSection,
}: SectionCardProps) {
  const [newTask, setNewTask] = useState('')
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState(section.name)

  const handleAddTask = () => {
    if (newTask.trim()) {
      onAddTask(newTask.trim())
      setNewTask('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask()
    }
  }

  const handleSaveName = () => {
    if (editedName.trim()) {
      onUpdateName(editedName.trim())
      setIsEditingName(false)
    }
  }

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveName()
    } else if (e.key === 'Escape') {
      setEditedName(section.name)
      setIsEditingName(false)
    }
  }

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        {isEditingName ? (
          <Input
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={handleNameKeyDown}
            className="text-lg font-semibold h-9"
            autoFocus
          />
        ) : (
          <h2 
            className="text-lg font-semibold cursor-pointer hover:text-primary"
            onClick={() => setIsEditingName(true)}
          >
            {section.name}
          </h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onDeleteSection}
          className="h-7 w-7 hover:bg-destructive/20 hover:text-destructive"
        >
          <Trash className="h-3.5 w-3.5" />
        </Button>
      </div>

      <Button
        onClick={onSpinSection}
        disabled={section.tasks.length === 0 || isSpinning || isSectionSpinning}
        className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <Sparkle className="h-4 w-4" weight="fill" />
        {isSectionSpinning ? 'Spinning...' : 'Spin This Section'}
      </Button>

      <div className="flex gap-2">
        <Input
          placeholder="Enter a new task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 text-sm h-9"
        />
        <Button onClick={handleAddTask} className="gap-2 h-9 px-3 text-sm">
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      <ScrollArea className="h-[400px] pr-3">
        <AnimatePresence mode="popLayout">
          {section.tasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-[300px] text-muted-foreground"
            >
              <Sparkle className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-sm">No tasks yet</p>
              <p className="text-xs">Add your first task to get started</p>
            </motion.div>
          ) : (
            <Reorder.Group
              axis="y"
              values={section.tasks}
              onReorder={onReorderTasks}
              className="space-y-1.5"
            >
              {section.tasks.map((task, index) => (
                <TaskItem
                  key={task}
                  task={task}
                  index={index}
                  isSelected={selectedTask === index}
                  isSpinning={isSpinning || isSectionSpinning}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                />
              ))}
            </Reorder.Group>
          )}
        </AnimatePresence>
      </ScrollArea>
    </Card>
  )
}
