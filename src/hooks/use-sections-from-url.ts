import { useState, useEffect } from 'react'

export interface TaskSection {
  id: string
  name: string
  tasks: string[]
}

export function useSectionsFromURL() {
  const [sections, setSections] = useState<TaskSection[]>([])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const encoded = params.get('sections')
    if (encoded) {
      try {
        const json = decodeURIComponent(atob(encoded))
        const parsed = JSON.parse(json)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSections(parsed)
        } else {
          setSections([{
            id: `section-${Date.now()}`,
            name: 'Section 1',
            tasks: []
          }])
        }
      } catch (error) {
        console.error('Failed to decode sections from URL:', error)
        setSections([{
          id: `section-${Date.now()}`,
          name: 'Section 1',
          tasks: []
        }])
      }
    } else {
      setSections([{
        id: `section-${Date.now()}`,
        name: 'Section 1',
        tasks: []
      }])
    }
  }, [])

  useEffect(() => {
    const newUrl = new URL(window.location.href)
    if (sections.length > 0) {
      const json = JSON.stringify(sections)
      const encoded = btoa(encodeURIComponent(json))
      newUrl.searchParams.set('sections', encoded)
    } else {
      newUrl.searchParams.delete('sections')
    }
    window.history.replaceState({}, '', newUrl.toString())
  }, [sections])

  return [sections, setSections] as const
}
