import type { TaskSection } from '@/types/section'
import { useSectionsFromURL } from './use-sections-from-url'

export function useSectionManager() {
  const [sections, setSections] = useSectionsFromURL()

  const addSection = () => {
    const newSection: TaskSection = {
      id: `section-${Date.now()}`,
      name: `Section ${sections.length + 1}`,
      tasks: [],
    }
    setSections((current) => [...current, newSection])
  }

  const deleteSection = (sectionId: string) => {
    setSections((current) => current.filter((s) => s.id !== sectionId))
  }

  const updateSectionName = (sectionId: string, name: string) => {
    setSections((current) =>
      current.map((s) => (s.id === sectionId ? { ...s, name } : s))
    )
  }

  const addTask = (sectionId: string, task: string) => {
    setSections((current) =>
      current.map((s) =>
        s.id === sectionId ? { ...s, tasks: [...s.tasks, task] } : s
      )
    )
  }

  const editTask = (sectionId: string, index: number, value: string) => {
    setSections((current) =>
      current.map((s) =>
        s.id === sectionId
          ? { ...s, tasks: s.tasks.map((t, i) => (i === index ? value : t)) }
          : s
      )
    )
  }

  const deleteTask = (sectionId: string, index: number) => {
    setSections((current) =>
      current.map((s) =>
        s.id === sectionId
          ? { ...s, tasks: s.tasks.filter((_, i) => i !== index) }
          : s
      )
    )
  }

  const reorderTasks = (sectionId: string, newOrder: string[]) => {
    setSections((current) =>
      current.map((s) => (s.id === sectionId ? { ...s, tasks: newOrder } : s))
    )
  }

  const getSection = (sectionId: string) => {
    return sections.find((s) => s.id === sectionId)
  }

  return {
    sections,
    addSection,
    deleteSection,
    updateSectionName,
    addTask,
    editTask,
    deleteTask,
    reorderTasks,
    getSection,
  }
}
