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
      const minSpins = section.tasks.length * 3
      const extraSpins = Math.floor(Math.random() * section.tasks.length * 2)
      
      return {
        sectionId: section.id,
        taskCount: section.tasks.length,
        totalSteps: minSpins + extraSpins + finalSelection,
        finalSelection,
      }
    })
  }

  static calculateStepDelay(step: number, maxSteps: number): number {
    const progress = step / maxSteps
    if (progress > 0.6) {
      return 30 + (progress - 0.6) * 1600
    }
    return 30
  }

  static getNextIndex(currentIndex: number, taskCount: number): number {
    return (currentIndex + 1) % taskCount
  }
}
