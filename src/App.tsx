import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion'
import { Plus, X, DotsSixVertical, Copy, Sparkle, PencilSimple, Check, Trash } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { useSectionsFromURL, type TaskSection } from '@/hooks/use-sections-from-url'
import { cn } from '@/lib/utils'

interface TaskItemProps {
  task: string
  index: number
  isSelected: boolean
  isSpinning: boolean
  onEdit: (index: number, value: string) => void
  onDelete: (index: number) => void
}

function TaskItem({ task, index, isSelected, isSpinning, onEdit, onDelete }: TaskItemProps) {
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
        'group flex items-center gap-2 p-3 rounded-lg border bg-card hover:bg-card/80 transition-colors select-none',
        isSelected && isSpinning && 'bg-primary/20 border-primary/40 spin-highlight',
        isSelected && !isSpinning && 'ring-2 ring-accent shadow-lg shadow-accent/20'
      )}
    >
      <div 
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-primary/20 rounded"
        onPointerDown={(e) => controls.start(e)}
      >
        <DotsSixVertical weight="bold" className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="flex-1 flex items-center gap-2">
        <span className="text-muted-foreground font-semibold text-sm w-6">{index + 1}</span>
        {isEditing ? (
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="flex-1"
            autoFocus
          />
        ) : (
          <span className="flex-1 truncate">{task}</span>
        )}
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {isEditing ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSave}
            className="h-8 w-8 hover:bg-accent hover:text-accent-foreground"
          >
            <Check className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(true)}
            className="h-8 w-8 hover:bg-primary/20"
          >
            <PencilSimple className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(index)}
          className="h-8 w-8 hover:bg-destructive/20 hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Reorder.Item>
  )
}

interface SectionCardProps {
  section: TaskSection
  selectedTask: number | null
  isSpinning: boolean
  onUpdateName: (name: string) => void
  onAddTask: (task: string) => void
  onEditTask: (index: number, value: string) => void
  onDeleteTask: (index: number) => void
  onReorderTasks: (newOrder: string[]) => void
  onDeleteSection: () => void
}

function SectionCard({
  section,
  selectedTask,
  isSpinning,
  onUpdateName,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onReorderTasks,
  onDeleteSection,
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
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-2">
        {isEditingName ? (
          <Input
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={handleNameKeyDown}
            className="text-xl font-semibold"
            autoFocus
          />
        ) : (
          <h2 
            className="text-xl font-semibold cursor-pointer hover:text-primary"
            onClick={() => setIsEditingName(true)}
          >
            {section.name}
          </h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onDeleteSection}
          className="h-8 w-8 hover:bg-destructive/20 hover:text-destructive"
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Enter a new task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button onClick={handleAddTask} className="gap-2">
          <Plus className="h-5 w-5" />
          Add
        </Button>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <AnimatePresence mode="popLayout">
          {section.tasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-[300px] text-muted-foreground"
            >
              <Sparkle className="h-12 w-12 mb-4 opacity-50" />
              <p>No tasks yet</p>
              <p className="text-sm">Add your first task to get started</p>
            </motion.div>
          ) : (
            <Reorder.Group
              axis="y"
              values={section.tasks}
              onReorder={onReorderTasks}
              className="space-y-2"
            >
              {section.tasks.map((task, index) => (
                <TaskItem
                  key={task}
                  task={task}
                  index={index}
                  isSelected={selectedTask === index}
                  isSpinning={isSpinning}
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

export default function App() {
  const [sections, setSections] = useSectionsFromURL()
  const [selectedTasks, setSelectedTasks] = useState<Map<string, number | null>>(new Map())
  const [isSpinning, setIsSpinning] = useState(false)

  const handleAddSection = () => {
    const newSection: TaskSection = {
      id: `section-${Date.now()}`,
      name: `Section ${sections.length + 1}`,
      tasks: [],
    }
    setSections((current) => [...current, newSection])
  }

  const handleDeleteSection = (sectionId: string) => {
    setSections((current) => current.filter((s) => s.id !== sectionId))
    setSelectedTasks((current) => {
      const newMap = new Map(current)
      newMap.delete(sectionId)
      return newMap
    })
  }

  const handleUpdateSectionName = (sectionId: string, name: string) => {
    setSections((current) =>
      current.map((s) => (s.id === sectionId ? { ...s, name } : s))
    )
  }

  const handleAddTask = (sectionId: string, task: string) => {
    setSections((current) =>
      current.map((s) =>
        s.id === sectionId ? { ...s, tasks: [...s.tasks, task] } : s
      )
    )
  }

  const handleEditTask = (sectionId: string, index: number, value: string) => {
    setSections((current) =>
      current.map((s) =>
        s.id === sectionId
          ? { ...s, tasks: s.tasks.map((t, i) => (i === index ? value : t)) }
          : s
      )
    )
  }

  const handleDeleteTask = (sectionId: string, index: number) => {
    setSections((current) =>
      current.map((s) =>
        s.id === sectionId
          ? { ...s, tasks: s.tasks.filter((_, i) => i !== index) }
          : s
      )
    )

    setSelectedTasks((current) => {
      const selectedTask = current.get(sectionId)
      if (selectedTask === index) {
        const newMap = new Map(current)
        newMap.set(sectionId, null)
        return newMap
      } else if (selectedTask !== null && selectedTask !== undefined && index < selectedTask) {
        const newMap = new Map(current)
        newMap.set(sectionId, selectedTask - 1)
        return newMap
      }
      return current
    })
  }

  const handleReorderTasks = (sectionId: string, newOrder: string[]) => {
    setSections((current) =>
      current.map((s) => (s.id === sectionId ? { ...s, tasks: newOrder } : s))
    )

    setSelectedTasks((current) => {
      const section = sections.find((s) => s.id === sectionId)
      const selectedTask = current.get(sectionId)
      if (section && selectedTask !== null && selectedTask !== undefined) {
        const selectedTaskValue = section.tasks[selectedTask]
        const newIndex = newOrder.indexOf(selectedTaskValue)
        const newMap = new Map(current)
        newMap.set(sectionId, newIndex >= 0 ? newIndex : null)
        return newMap
      }
      return current
    })
  }

  const handleSpinAll = async () => {
    const sectionsWithTasks = sections.filter((s) => s.tasks.length > 0)
    if (sectionsWithTasks.length === 0 || isSpinning) return

    setIsSpinning(true)

    const initialSelections = new Map<string, number>()
    sectionsWithTasks.forEach((section) => {
      initialSelections.set(section.id, 0)
    })
    setSelectedTasks(initialSelections)

    const finalSelections = new Map<string, number>()
    const spinConfigs = sectionsWithTasks.map((section) => {
      const finalSelection = Math.floor(Math.random() * section.tasks.length)
      finalSelections.set(section.id, finalSelection)
      const minSpins = section.tasks.length * 3
      const extraSpins = Math.floor(Math.random() * section.tasks.length * 2)
      return {
        sectionId: section.id,
        taskCount: section.tasks.length,
        totalSteps: minSpins + extraSpins + finalSelection,
        finalSelection,
      }
    })

    const maxSteps = Math.max(...spinConfigs.map((c) => c.totalSteps))

    for (let step = 0; step < maxSteps; step++) {
      const progress = step / maxSteps
      let stepDelay = 30
      if (progress > 0.6) {
        stepDelay = 30 + (progress - 0.6) * 400
      }

      await new Promise((resolve) => setTimeout(resolve, stepDelay))

      setSelectedTasks((current) => {
        const newMap = new Map(current)
        spinConfigs.forEach((config) => {
          if (step < config.totalSteps) {
            const currentIndex = current.get(config.sectionId) ?? 0
            newMap.set(config.sectionId, (currentIndex + 1) % config.taskCount)
          }
        })
        return newMap
      })
    }

    setSelectedTasks(finalSelections)
    setIsSpinning(false)
  }

  const handleCopyURL = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('URL copied to clipboard!')
    } catch {
      toast.error('Failed to copy URL')
    }
  }

  const hasAnyTasks = sections.some((s) => s.tasks.length > 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Task Roulette
          </h1>
          <p className="text-muted-foreground text-lg">
            Create sections, add tasks, and spin them all at once
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={handleAddSection}
              variant="outline"
              className="gap-2"
            >
              <Plus className="h-5 w-5" />
              Add Section
            </Button>
            <Button
              onClick={handleCopyURL}
              variant="outline"
              disabled={sections.length === 0}
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy URL
            </Button>
          </div>
        </motion.header>

        {sections.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-[400px] text-muted-foreground"
          >
            <Sparkle className="h-16 w-16 mb-4 opacity-50" />
            <p className="text-xl">No sections yet</p>
            <p className="text-sm">Click "Add Section" to get started</p>
          </motion.div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sections.map((section, index) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <SectionCard
                    section={section}
                    selectedTask={selectedTasks.get(section.id) ?? null}
                    isSpinning={isSpinning}
                    onUpdateName={(name) => handleUpdateSectionName(section.id, name)}
                    onAddTask={(task) => handleAddTask(section.id, task)}
                    onEditTask={(index, value) => handleEditTask(section.id, index, value)}
                    onDeleteTask={(index) => handleDeleteTask(section.id, index)}
                    onReorderTasks={(newOrder) => handleReorderTasks(section.id, newOrder)}
                    onDeleteSection={() => handleDeleteSection(section.id)}
                  />
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center"
            >
              <Button
                onClick={handleSpinAll}
                disabled={!hasAnyTasks || isSpinning}
                className={cn(
                  'h-16 px-12 text-lg font-semibold gap-3 bg-accent text-accent-foreground hover:bg-accent/90',
                  !isSpinning && hasAnyTasks && 'pulse-glow'
                )}
              >
                <Sparkle className="h-6 w-6" weight="fill" />
                {isSpinning ? 'Spinning...' : 'Spin All Sections'}
              </Button>
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}
