import { describe, it, expect } from 'vitest'
import { formatSectionsAsMarkdown, parseMarkdownSections, LLM_PREAMBLE } from './markdown-sections'

const strip = (s: { name: string; tasks: string[] }[]) => s.map(({ name, tasks }) => ({ name, tasks }))

describe('parseMarkdownSections', () => {
  it('parses headings and bullets', () => {
    const r = parseMarkdownSections('## Chores\n- Dishes\n- Laundry\n\n## Work\n- Email')
    expect(strip(r)).toEqual([
      { name: 'Chores', tasks: ['Dishes', 'Laundry'] },
      { name: 'Work', tasks: ['Email'] },
    ])
  })

  it('accepts all bullet styles, numbering, checkboxes, CRLF and indentation', () => {
    const r = parseMarkdownSections('# A\r\n* one\r\n+ two\r\n1. three\r\n2) four\r\n  - [ ] five\r\n- [x] six')
    expect(r[0].tasks).toEqual(['one', 'two', 'three', 'four', 'five', 'six'])
  })

  it('ignores prose and code fences', () => {
    const r = parseMarkdownSections('Sure! Here you go:\n```markdown\n## A\n- x\n```\nHope that helps.')
    expect(strip(r)).toEqual([{ name: 'A', tasks: ['x'] }])
  })

  it('treats a plain list as one section', () => {
    const r = parseMarkdownSections('- a\n- b')
    expect(strip(r)).toEqual([{ name: 'Section 1', tasks: ['a', 'b'] }])
  })

  it('strips wrapping bold but keeps inner emphasis', () => {
    const r = parseMarkdownSections('## **Big**\n- **Whole**\n- some **part** bold')
    expect(strip(r)).toEqual([{ name: 'Big', tasks: ['Whole', 'some **part** bold'] }])
  })

  it('drops empty sections and handles empty input / unicode', () => {
    expect(parseMarkdownSections('')).toEqual([])
    expect(parseMarkdownSections('## Only heading')).toEqual([])
    expect(strip(parseMarkdownSections('## 🍕\n- crème brûlée'))).toEqual([{ name: '🍕', tasks: ['crème brûlée'] }])
  })

  it('gives unique ids', () => {
    const r = parseMarkdownSections('## A\n- 1\n## A\n- 2')
    expect(new Set(r.map((s) => s.id)).size).toBe(2)
  })
})

describe('formatSectionsAsMarkdown', () => {
  const sections = [
    { id: '1', name: 'Chores', tasks: ['Dishes', 'Laundry'] },
    { id: '2', name: 'Work', tasks: ['Email'] },
  ]

  it('round-trips', () => {
    expect(strip(parseMarkdownSections(formatSectionsAsMarkdown(sections)))).toEqual(strip(sections))
  })

  it('includes the preamble only when asked', () => {
    expect(formatSectionsAsMarkdown(sections)).toContain(LLM_PREAMBLE)
    expect(formatSectionsAsMarkdown(sections, false).startsWith('## Chores')).toBe(true)
  })
})
