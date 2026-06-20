import type { TaskSection } from '@/types/section'

export interface SpinConfig {
  sectionId: string
  taskCount: number
  totalSteps: number
  finalSelection: number
}

export class SpinEngine {
  static calculateSpinConfigs(sections: TaskSection[]): SpinConfig[] {
    const sectionsWithTasks = sections.filter((s) => s.tasks.length > 0)
    
    return sectionsWithTasks.map((section) => {
      const finalSelection = Math.floor(Math.random() * section.tasks.length)
      const minFullRotations = 3
      const extraFullRotations = Math.floor(Math.random() * 2)
      const totalFullRotations = minFullRotations + extraFullRotations
      const totalSteps = (totalFullRotations * section.tasks.length) + finalSelection
      
      return {
        sectionId: section.id,
        taskCount: section.tasks.length,
        totalSteps,
        finalSelection,
      }
    })
  }

  static calculateStepDelay(step: number, maxSteps: number): number {
    const progress = step / maxSteps
    if (progress > 0.6) {
      return 70 + (progress - 0.6) * 4000
    }
    return 70
  }

  static getNextIndex(currentIndex: number, taskCount: number): number {
    return (currentIndex + 1) % taskCount
  }
}
