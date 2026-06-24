import { motion } from 'framer-motion'
import { Plus, Copy, Sparkle } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useSectionManager } from '@/hooks/use-section-manager'
import { useSpinController } from '@/hooks/use-spin-controller'
import { SectionCard } from '@/components/SectionCard'

export default function App() {
  const {
    sections,
    addSection,
    deleteSection,
    updateSectionName,
    addTask,
    editTask,
    deleteTask,
    reorderTasks,
    getSection,
  } = useSectionManager()

  const {
    selectedTasks,
    isSpinning,
    adjustSelectionAfterDelete,
    adjustSelectionAfterReorder,
    spinAll,
  } = useSpinController(sections)

  const handleDeleteTask = (sectionId: string, index: number) => {
    deleteTask(sectionId, index)
    adjustSelectionAfterDelete(sectionId, index)
  }

  const handleReorderTasks = (sectionId: string, newOrder: string[]) => {
    const section = getSection(sectionId)
    if (section) {
      adjustSelectionAfterReorder(sectionId, section.tasks, newOrder)
      reorderTasks(sectionId, newOrder)
    }
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
  const hasSingleSection = sections.length === 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Task Roulette
          </h1>
          <p className="text-muted-foreground">
            Create sections, add tasks, and spin them all at once
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button
              onClick={addSection}
              variant="outline"
              className="gap-2 h-9 text-sm"
            >
              <Plus className="h-4 w-4" />
              Add Section
            </Button>
            <Button
              onClick={handleCopyURL}
              variant="outline"
              disabled={sections.length === 0}
              className="gap-2 h-9 text-sm"
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
            <div className={cn(
              "grid gap-5",
              hasSingleSection ? "justify-items-center" : "md:grid-cols-2 lg:grid-cols-3"
            )}>
              {sections.map((section, index) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(hasSingleSection && "w-full max-w-md")}
                >
                  <SectionCard
                    section={section}
                    selectedTask={selectedTasks.get(section.id) ?? null}
                    isSpinning={isSpinning}
                    onUpdateName={(name) => updateSectionName(section.id, name)}
                    onAddTask={(task) => addTask(section.id, task)}
                    onEditTask={(index, value) => editTask(section.id, index, value)}
                    onDeleteTask={(index) => handleDeleteTask(section.id, index)}
                    onReorderTasks={(newOrder) => handleReorderTasks(section.id, newOrder)}
                    onDeleteSection={() => deleteSection(section.id)}
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
                onClick={spinAll}
                disabled={!hasAnyTasks || isSpinning}
                className={cn(
                  'h-14 px-10 text-base font-semibold gap-3 bg-accent text-accent-foreground hover:bg-accent/90',
                  !isSpinning && hasAnyTasks && 'pulse-glow'
                )}
              >
                <Sparkle className="h-5 w-5" weight="fill" />
                {isSpinning ? 'Spinning...' : 'Spin All Sections'}
              </Button>
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}
