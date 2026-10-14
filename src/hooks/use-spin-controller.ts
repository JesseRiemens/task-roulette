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

  const setSelection = (sectionId: string, index: number | null) => {
    setSelectedTasks((current) => new Map(current).set(sectionId, index))
  }

  const setSectionSpinning = (sectionId: string, spinning: boolean) => {
    setSpinningState((current) => new Map(current).set(sectionId, spinning))
  }

  const runSpin = async (section: TaskSection) => {
    const config = SpinEngine.calculateSpinConfigs([section])[0]
    let index = config.startIndex
    setSelection(section.id, index)

    for (let step = 0; step < config.totalSteps; step++) {
      await new Promise((resolve) =>
        setTimeout(resolve, SpinEngine.calculateStepDelay(step, config.totalSteps)),
      )
      index = SpinEngine.getNextIndex(index, config.taskCount)
      setSelection(section.id, index)
    }

    setSelection(section.id, config.finalSelection)
  }

  const spinSection = async (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId)
    if (!section || section.tasks.length === 0 || spinningState.get(sectionId)) return

    setSectionSpinning(sectionId, true)
    try {
      await runSpin(section)
    } finally {
      setSectionSpinning(sectionId, false)
    }
  }

  const spinAll = async () => {
    const sectionsWithTasks = sections.filter((s) => s.tasks.length > 0)
    if (sectionsWithTasks.length === 0 || isSpinning) return

    setIsSpinning(true)
    try {
      await Promise.all(sectionsWithTasks.map(runSpin))
    } finally {
      setIsSpinning(false)
    }
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
