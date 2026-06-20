import { useState, useEffect } from 'react'
import { defaultSectionEncoder, type SectionEncoder } from '@/lib/url-encoder'
import type { TaskSection } from '@/types/section'

export function useSectionsFromURL(encoder: SectionEncoder = defaultSectionEncoder) {
  const [sections, setSections] = useState<TaskSection[]>([])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const encoded = params.get('s')
    if (encoded) {
      try {
        const decoded = encoder.decodeSections(encoded)
        if (decoded.length > 0) {
          setSections(decoded)
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
  }, [encoder])

  useEffect(() => {
    const newUrl = new URL(window.location.href)
    if (sections.length > 0) {
      const encoded = encoder.encodeSections(sections)
      newUrl.searchParams.set('s', encoded)
    } else {
      newUrl.searchParams.delete('s')
    }
    window.history.replaceState({}, '', newUrl.toString())
  }, [sections, encoder])

  return [sections, setSections] as const
}
