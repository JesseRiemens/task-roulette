import { useState } from 'react'
import type { TaskSection } from '@/types/section'
import { SpinEngine } from '@/lib/spin-engine'

export function useSpinController(sections: TaskSection[]) {
  const [selectedTasks, setSelectedTasks] = useState<Map<string, number | null>>(new Map())
  const [isSpinning, setIsSpinning] = useState(false)
  const [spinningState, setSpinningState] = useState<Map<string, boolean>>(new Map())

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

  const spinSection = async (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId)
    if (!section || section.tasks.length === 0 || spinningState.get(sectionId)) return

    setSpinningState((current) => {
      const newMap = new Map(current)
      newMap.set(sectionId, true)
      return newMap
    })

    const config = SpinEngine.calculateSpinConfigs([section])[0]

    setSelectedTasks((current) => {
      const newMap = new Map(current)
      newMap.set(sectionId, 0)
      return newMap
    })

    for (let step = 0; step < config.totalSteps; step++) {
      const stepDelay = SpinEngine.calculateStepDelay(step, config.totalSteps)
      await new Promise((resolve) => setTimeout(resolve, stepDelay))

      setSelectedTasks((current) => {
        const currentIndex = current.get(sectionId) ?? 0
        const newMap = new Map(current)
        newMap.set(sectionId, SpinEngine.getNextIndex(currentIndex, config.taskCount))
        return newMap
      })
    }

    setSelectedTasks((current) => {
      const newMap = new Map(current)
      newMap.set(sectionId, config.finalSelection)
      return newMap
    })

    setSpinningState((current) => {
      const newMap = new Map(current)
      newMap.set(sectionId, false)
      return newMap
    })
  }

  const spinAll = async () => {
    const sectionsWithTasks = sections.filter((s) => s.tasks.length > 0)
    if (sectionsWithTasks.length === 0 || isSpinning) return

    setIsSpinning(true)

    const spinPromises = sectionsWithTasks.map((section) => 
      (async () => {
        const config = SpinEngine.calculateSpinConfigs([section])[0]

        setSelectedTasks((current) => {
          const newMap = new Map(current)
          newMap.set(section.id, 0)
          return newMap
        })

        for (let step = 0; step < config.totalSteps; step++) {
          const stepDelay = SpinEngine.calculateStepDelay(step, config.totalSteps)
          await new Promise((resolve) => setTimeout(resolve, stepDelay))

          setSelectedTasks((current) => {
            const currentIndex = current.get(section.id) ?? 0
            const newMap = new Map(current)
            newMap.set(section.id, SpinEngine.getNextIndex(currentIndex, config.taskCount))
            return newMap
          })
        }

        setSelectedTasks((current) => {
          const newMap = new Map(current)
          newMap.set(section.id, config.finalSelection)
          return newMap
        })
      })()
    )

    await Promise.all(spinPromises)
    setIsSpinning(false)
  }

  return {
    selectedTasks,
    isSpinning,
    spinningState,
    clearSelection,
    adjustSelectionAfterDelete,
    adjustSelectionAfterReorder,
    spinSection,
    spinAll,
  }
}
