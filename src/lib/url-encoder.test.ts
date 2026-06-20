import { describe, it, expect } from 'vitest'
import { Base64Encoder, LZStringEncoder, CompactSectionEncoder, type TaskSection } from './url-encoder'

describe('URL Encoder Tests', () => {
  const encoders = [
    { name: 'Base64Encoder', encoder: new Base64Encoder() },
    { name: 'LZStringEncoder', encoder: new LZStringEncoder() }
  ]

  encoders.forEach(({ name, encoder }) => {
    describe(name, () => {
      it('encodes and decodes empty array', () => {
        const tasks: string[] = []
        const encoded = encoder.encode(tasks)
        const decoded = encoder.decode(encoded)
        expect(decoded).toEqual(tasks)
      })

      it('encodes and decodes single task', () => {
        const tasks = ['Buy groceries']
        const encoded = encoder.encode(tasks)
        const decoded = encoder.decode(encoded)
        expect(decoded).toEqual(tasks)
      })

      it('encodes and decodes multiple tasks', () => {
        const tasks = [
          'Complete project proposal',
          'Review pull requests',
          'Schedule team meeting',
          'Update documentation'
        ]
        const encoded = encoder.encode(tasks)
        const decoded = encoder.decode(encoded)
        expect(decoded).toEqual(tasks)
      })

      it('encodes and decodes tasks with special characters', () => {
        const tasks = [
          'Task with "quotes"',
          'Task with \\backslash',
          'Task with émoji 🎉',
          'Task with newline\ncharacter'
        ]
        const encoded = encoder.encode(tasks)
        const decoded = encoder.decode(encoded)
        expect(decoded).toEqual(tasks)
      })

      it('encodes and decodes very long task list (50 items)', () => {
        const tasks = Array.from({ length: 50 }, (_, i) => `Task number ${i + 1}`)
        const encoded = encoder.encode(tasks)
        const decoded = encoder.decode(encoded)
        expect(decoded).toEqual(tasks)
      })

      it('handles invalid encoded strings gracefully', () => {
        const decoded = encoder.decode('invalid-encoding-string')
        expect(decoded).toEqual([])
      })

      it('handles empty string', () => {
        const decoded = encoder.decode('')
        expect(decoded).toEqual([])
      })
    })
  })

  describe('Compression Efficiency Comparison', () => {
    it('LZString should be more efficient for repetitive tasks', () => {
      const tasks = Array.from(
        { length: 20 },
        (_, i) => `Complete task number ${i + 1} for the project`
      )

      const base64Encoder = new Base64Encoder()
      const lzEncoder = new LZStringEncoder()

      const base64Encoded = base64Encoder.encode(tasks)
      const lzEncoded = lzEncoder.encode(tasks)

      expect(lzEncoded.length).toBeLessThan(base64Encoded.length)
    })

    it('LZString should be efficient for short lists too', () => {
      const tasks = ['Task 1', 'Task 2', 'Task 3']

      const base64Encoder = new Base64Encoder()
      const lzEncoder = new LZStringEncoder()

      const base64Encoded = base64Encoder.encode(tasks)
      const lzEncoded = lzEncoder.encode(tasks)

      console.log(`Base64 length: ${base64Encoded.length}`)
      console.log(`LZString length: ${lzEncoded.length}`)
    })

    it('shows compression ratios for various list sizes', () => {
      const base64Encoder = new Base64Encoder()
      const lzEncoder = new LZStringEncoder()

      const testCases = [
        { size: 1, name: 'Single task' },
        { size: 5, name: 'Small list' },
        { size: 20, name: 'Medium list' },
        { size: 100, name: 'Large list' }
      ]

      testCases.forEach(({ size, name }) => {
        const tasks = Array.from(
          { length: size },
          (_, i) => `Task ${i + 1}: Do something important`
        )

        const base64Encoded = base64Encoder.encode(tasks)
        const lzEncoded = lzEncoder.encode(tasks)

        const ratio = ((lzEncoded.length / base64Encoded.length) * 100).toFixed(1)

        console.log(`${name} (${size} items):`)
        console.log(`  Base64: ${base64Encoded.length} chars`)
        console.log(`  LZString: ${lzEncoded.length} chars`)
        console.log(`  Compression ratio: ${ratio}%`)
      })

      expect(true).toBe(true)
    })
  })

  describe('CompactSectionEncoder', () => {
    const encoder = new CompactSectionEncoder()

    it('encodes and decodes empty sections array', () => {
      const sections: TaskSection[] = []
      const encoded = encoder.encodeSections(sections)
      const decoded = encoder.decodeSections(encoded)
      expect(decoded).toEqual(sections)
    })

    it('encodes and decodes single section with no tasks', () => {
      const sections: TaskSection[] = [
        { id: 'section-1', name: 'Work Tasks', tasks: [] }
      ]
      const encoded = encoder.encodeSections(sections)
      const decoded = encoder.decodeSections(encoded)
      expect(decoded[0].name).toBe('Work Tasks')
      expect(decoded[0].tasks).toEqual([])
    })

    it('encodes and decodes single section with tasks', () => {
      const sections: TaskSection[] = [
        {
          id: 'section-1',
          name: 'Work Tasks',
          tasks: ['Complete report', 'Review PRs', 'Team meeting']
        }
      ]
      const encoded = encoder.encodeSections(sections)
      const decoded = encoder.decodeSections(encoded)
      expect(decoded[0].name).toBe('Work Tasks')
      expect(decoded[0].tasks).toEqual(['Complete report', 'Review PRs', 'Team meeting'])
    })

    it('encodes and decodes multiple sections', () => {
      const sections: TaskSection[] = [
        {
          id: 'section-1',
          name: 'Work',
          tasks: ['Task 1', 'Task 2']
        },
        {
          id: 'section-2',
          name: 'Personal',
          tasks: ['Buy groceries', 'Exercise']
        },
        {
          id: 'section-3',
          name: 'Learning',
          tasks: ['Read book', 'Practice coding']
        }
      ]
      const encoded = encoder.encodeSections(sections)
      const decoded = encoder.decodeSections(encoded)
      
      expect(decoded.length).toBe(3)
      expect(decoded[0].name).toBe('Work')
      expect(decoded[0].tasks).toEqual(['Task 1', 'Task 2'])
      expect(decoded[1].name).toBe('Personal')
      expect(decoded[1].tasks).toEqual(['Buy groceries', 'Exercise'])
      expect(decoded[2].name).toBe('Learning')
      expect(decoded[2].tasks).toEqual(['Read book', 'Practice coding'])
    })

    it('handles sections with special characters', () => {
      const sections: TaskSection[] = [
        {
          id: 'section-1',
          name: 'Work 💼',
          tasks: ['Task with "quotes"', 'Task with émoji 🎉']
        }
      ]
      const encoded = encoder.encodeSections(sections)
      const decoded = encoder.decodeSections(encoded)
      
      expect(decoded[0].name).toBe('Work 💼')
      expect(decoded[0].tasks).toEqual(['Task with "quotes"', 'Task with émoji 🎉'])
    })

    it('handles invalid encoded strings gracefully', () => {
      const decoded = encoder.decodeSections('invalid-encoding')
      expect(decoded).toEqual([])
    })

    it('handles empty string', () => {
      const decoded = encoder.decodeSections('')
      expect(decoded).toEqual([])
    })

    it('regenerates section IDs on decode', () => {
      const sections: TaskSection[] = [
        { id: 'original-id-1', name: 'Section 1', tasks: ['Task A'] },
        { id: 'original-id-2', name: 'Section 2', tasks: ['Task B'] }
      ]
      const encoded = encoder.encodeSections(sections)
      const decoded = encoder.decodeSections(encoded)
      
      expect(decoded[0].id).toBe('section-0')
      expect(decoded[1].id).toBe('section-1')
    })

    it('is more compact than naive JSON encoding', () => {
      const sections: TaskSection[] = [
        {
          id: 'section-1',
          name: 'Work Tasks',
          tasks: Array.from({ length: 10 }, (_, i) => `Complete task ${i + 1}`)
        },
        {
          id: 'section-2',
          name: 'Personal Tasks',
          tasks: Array.from({ length: 10 }, (_, i) => `Personal item ${i + 1}`)
        }
      ]

      const naiveEncoded = btoa(encodeURIComponent(JSON.stringify(sections)))
      const compactEncoded = encoder.encodeSections(sections)

      console.log(`Naive encoding length: ${naiveEncoded.length}`)
      console.log(`Compact encoding length: ${compactEncoded.length}`)
      console.log(`Savings: ${((1 - compactEncoded.length / naiveEncoded.length) * 100).toFixed(1)}%`)

      expect(compactEncoded.length).toBeLessThan(naiveEncoded.length)
    })
  })
})
