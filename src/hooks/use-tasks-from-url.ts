import { useState, useEffect } from 'react'
import { defaultEncoder, type URLEncoder } from '@/lib/url-encoder'

export function useTasksFromURL(encoder: URLEncoder = defaultEncoder) {
  const [tasks, setTasks] = useState<string[]>([])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const encoded = params.get('tasks')
    if (encoded) {
      try {
        const decoded = encoder.decode(encoded)
        if (decoded.length > 0) {
          setTasks(decoded)
        }
      } catch (error) {
        console.error('Failed to decode tasks from URL:', error)
      }
    }
  }, [encoder])

  useEffect(() => {
    const newUrl = new URL(window.location.href)
    if (tasks.length > 0) {
      const encoded = encoder.encode(tasks)
      newUrl.searchParams.set('tasks', encoded)
    } else {
      newUrl.searchParams.delete('tasks')
    }
    window.history.replaceState({}, '', newUrl.toString())
  }, [tasks, encoder])

  return [tasks, setTasks] as const
}
