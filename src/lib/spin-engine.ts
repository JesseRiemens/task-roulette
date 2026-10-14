import type { TaskSection } from '@/types/section'

export interface SpinConfig {
  sectionId: string
  taskCount: number
  totalSteps: number
  finalSelection: number
  startIndex: number
}

const MAX_STEPS = 36
const BASE_DELAY_MS = 45

export class SpinEngine {
  static calculateSpinConfigs(sections: TaskSection[]): SpinConfig[] {
    const sectionsWithTasks = sections.filter((s) => s.tasks.length > 0)
    
    return sectionsWithTasks.map((section) => {
      const finalSelection = Math.floor(Math.random() * section.tasks.length)
      const minFullRotations = 3
      const extraFullRotations = Math.floor(Math.random() * 2)
      const totalFullRotations = minFullRotations + extraFullRotations
      const totalSteps = Math.min(
        (totalFullRotations * section.tasks.length) + finalSelection + 1,
        MAX_STEPS,
      )
      // Start so that walking totalSteps lands exactly on finalSelection
      const n = section.tasks.length
      const startIndex = (((finalSelection - totalSteps) % n) + n) % n
      
      return {
        sectionId: section.id,
        taskCount: section.tasks.length,
        totalSteps,
        finalSelection,
        startIndex,
      }
    })
  }

  static calculateStepDelay(step: number, maxSteps: number): number {
    const progress = step / maxSteps
    if (progress > 0.6) {
      return BASE_DELAY_MS + (progress - 0.6) * 1500
    }
    return BASE_DELAY_MS
  }

  static getNextIndex(currentIndex: number, taskCount: number): number {
    return (currentIndex + 1) % taskCount
  }
}
