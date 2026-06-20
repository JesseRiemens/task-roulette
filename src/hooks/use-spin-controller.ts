import { useState } from 'react'
import type { TaskSection } from '@/types/section'
import { SpinEngine } from '@/lib/spin-engine'

export function useSpinController(sections: TaskSection[]) {
  const [selectedTasks, setSelectedTasks] = useState<Map<string, number | null>>(new Map())
  const [isSpinning, setIsSpinning] = useState(false)

  const clearSelection = (sectionId: string) => {
    setSelectedTasks((current) => {
      const newMap = new Map(current)
      newMap.set(sectionId, null)
      return newMap
    })
  }

  const adjustSelectionAfterDelete = (sectionId: string, deletedIndex: number) => {
    setSelectedTasks((current) => {
      const selectedTask = current.get(sectionId)
      if (selectedTask === deletedIndex) {
        const newMap = new Map(current)
        newMap.set(sectionId, null)
        return newMap
      } else if (selectedTask !== null && selectedTask !== undefined && deletedIndex < selectedTask) {
        const newMap = new Map(current)
        newMap.set(sectionId, selectedTask - 1)
        return newMap
      }
      return current
    })
  }

  const adjustSelectionAfterReorder = (sectionId: string, oldTasks: string[], newOrder: string[]) => {
    setSelectedTasks((current) => {
      const selectedTask = current.get(sectionId)
      if (selectedTask !== null && selectedTask !== undefined) {
        const selectedTaskValue = oldTasks[selectedTask]
        const newIndex = newOrder.indexOf(selectedTaskValue)
        const newMap = new Map(current)
        newMap.set(sectionId, newIndex >= 0 ? newIndex : null)
        return newMap
      }
      return current
    })
  }

  const spinAll = async () => {
    const sectionsWithTasks = sections.filter((s) => s.tasks.length > 0)
    if (sectionsWithTasks.length === 0 || isSpinning) return

    setIsSpinning(true)

    const initialSelections = new Map<string, number>()
    sectionsWithTasks.forEach((section) => {
      initialSelections.set(section.id, 0)
    })
    setSelectedTasks(initialSelections)

    const spinConfigs = SpinEngine.calculateSpinConfigs(sectionsWithTasks)
    const maxSteps = Math.max(...spinConfigs.map((c) => c.totalSteps))

    for (let step = 0; step < maxSteps; step++) {
      const stepDelay = SpinEngine.calculateStepDelay(step, maxSteps)
      await new Promise((resolve) => setTimeout(resolve, stepDelay))

      setSelectedTasks((current) => {
        const newMap = new Map(current)
        spinConfigs.forEach((config) => {
          if (step < config.totalSteps) {
            const currentIndex = current.get(config.sectionId) ?? 0
            newMap.set(config.sectionId, SpinEngine.getNextIndex(currentIndex, config.taskCount))
          }
        })
        return newMap
      })
    }

    const finalSelections = new Map<string, number>()
    spinConfigs.forEach((config) => {
      finalSelections.set(config.sectionId, config.finalSelection)
    })
    setSelectedTasks(finalSelections)
    setIsSpinning(false)
  }

  return {
    selectedTasks,
    isSpinning,
    clearSelection,
    adjustSelectionAfterDelete,
    adjustSelectionAfterReorder,
    spinAll,
  }
}
