import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, DotsSixVertical, Copy, Sparkle, PencilSimple, Check } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { useTasksFromURL } from '@/hooks/use-tasks-from-url'
import { cn } from '@/lib/utils'

interface TaskItemProps {
  task: string
  index: number
  isSelected: boolean
  isSpinning: boolean
  onEdit: (index: number, value: string) => void
  onDelete: (index: number) => void
  onMoveUp: (index: number) => void
  onMoveDown: (index: number) => void
}

function TaskItem({ task, index, isSelected, isSpinning, onEdit, onDelete, onMoveUp, onMoveDown }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(task)
  const itemRef = useRef<HTMLDivElement>(null)

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
    <motion.div
      ref={itemRef}
      layout
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
        'group flex items-center gap-2 p-3 rounded-lg border bg-card hover:bg-card/80 transition-colors',
        isSelected && isSpinning && 'bg-primary/20 border-primary/40 spin-highlight',
        isSelected && !isSpinning && 'ring-2 ring-accent shadow-lg shadow-accent/20'
      )}
    >
      <div className="flex flex-col gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-4 w-6 cursor-move hover:bg-primary/20 text-muted-foreground"
          onClick={() => onMoveUp(index)}
        >
          <DotsSixVertical weight="bold" className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-4 w-6 cursor-move hover:bg-primary/20 text-muted-foreground"
          onClick={() => onMoveDown(index)}
        >
          <DotsSixVertical weight="bold" className="h-4 w-4" />
        </Button>
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
    </motion.div>
  )
}

function RouletteDisplay({ result, isSpinning }: { result: number | null; isSpinning: boolean }) {
  return (
    <Card className="p-8 flex flex-col items-center justify-center min-h-[200px] bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
      <div className="text-muted-foreground text-sm font-medium uppercase tracking-wider mb-4">
        Selected Task
      </div>
      <motion.div
        key={isSpinning ? 'spinning' : 'result'}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn(
          'text-7xl font-bold',
          isSpinning && 'text-muted-foreground',
          !isSpinning && result !== null && 'text-accent'
        )}
      >
        {result !== null ? result + 1 : '?'}
      </motion.div>
      {!isSpinning && result !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-muted-foreground text-sm"
        >
          Task #{result + 1}
        </motion.div>
      )}
    </Card>
  )
}

export default function App() {
  const [tasks, setTasks] = useTasksFromURL()
  const [newTask, setNewTask] = useState('')
  const [selectedTask, setSelectedTask] = useState<number | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)

  const handleAddTask = () => {
    if (newTask.trim()) {
      setTasks((current) => [...current, newTask.trim()])
      setNewTask('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask()
    }
  }

  const handleDeleteTask = (index: number) => {
    setTasks((current) => current.filter((_, i) => i !== index))
    if (selectedTask === index) {
      setSelectedTask(null)
    } else if (selectedTask !== null && index < selectedTask) {
      setSelectedTask(selectedTask - 1)
    }
  }

  const handleEditTask = (index: number, value: string) => {
    setTasks((current) => current.map((task, i) => (i === index ? value : task)))
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    setTasks((current) => {
      const newTasks = [...current]
      ;[newTasks[index - 1], newTasks[index]] = [newTasks[index], newTasks[index - 1]]
      return newTasks
    })
    if (selectedTask === index) {
      setSelectedTask(index - 1)
    } else if (selectedTask === index - 1) {
      setSelectedTask(index)
    }
  }

  const handleMoveDown = (index: number) => {
    if (index === tasks.length - 1) return
    setTasks((current) => {
      const newTasks = [...current]
      ;[newTasks[index], newTasks[index + 1]] = [newTasks[index + 1], newTasks[index]]
      return newTasks
    })
    if (selectedTask === index) {
      setSelectedTask(index + 1)
    } else if (selectedTask === index + 1) {
      setSelectedTask(index)
    }
  }

  const handleSpin = async () => {
    if (tasks.length === 0 || isSpinning) return

    setIsSpinning(true)
    setSelectedTask(null)

    const spinDuration = 2000
    const updateInterval = 50
    const updates = spinDuration / updateInterval

    for (let i = 0; i < updates; i++) {
      await new Promise((resolve) => setTimeout(resolve, updateInterval))
      setSelectedTask(Math.floor(Math.random() * tasks.length))
    }

    const finalSelection = Math.floor(Math.random() * tasks.length)
    setSelectedTask(finalSelection)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Task Roulette
          </h1>
          <p className="text-muted-foreground text-lg">
            Add your tasks and let fate decide what's next
          </p>
        </motion.header>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Your Tasks</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyURL}
                  disabled={tasks.length === 0}
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy URL
                </Button>
              </div>

              <div className="flex gap-2">
                <Input
                  id="new-task-input"
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
                  {tasks.length === 0 ? (
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
                    <div className="space-y-2">
                      {tasks.map((task, index) => (
                        <TaskItem
                          key={`${task}-${index}`}
                          task={task}
                          index={index}
                          isSelected={selectedTask === index}
                          isSpinning={isSpinning}
                          onEdit={handleEditTask}
                          onDelete={handleDeleteTask}
                          onMoveUp={handleMoveUp}
                          onMoveDown={handleMoveDown}
                        />
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </ScrollArea>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <RouletteDisplay result={selectedTask} isSpinning={isSpinning} />

            {!isSpinning && selectedTask !== null && tasks[selectedTask] && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-lg bg-card border border-accent/30"
              >
                <div className="text-sm text-muted-foreground mb-2">Your selected task:</div>
                <div className="text-xl font-medium">{tasks[selectedTask]}</div>
              </motion.div>
            )}

            <Button
              onClick={handleSpin}
              disabled={tasks.length === 0 || isSpinning}
              className={cn(
                'w-full h-16 text-lg font-semibold gap-3 bg-accent text-accent-foreground hover:bg-accent/90',
                !isSpinning && tasks.length > 0 && 'pulse-glow'
              )}
            >
              <Sparkle className="h-6 w-6" weight="fill" />
              {isSpinning ? 'Spinning...' : 'Spin the Wheel'}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
