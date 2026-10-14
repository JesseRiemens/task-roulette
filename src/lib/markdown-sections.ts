import type { TaskSection } from '@/types/section'

export const LLM_PREAMBLE =
  'Here are my task lists (Markdown). When you reply, keep this exact format: "## Section name" headings with "- task" bullets, and nothing else.'

const HEADING = /^\s{0,3}#{1,6}\s+(.*?)\s*#*\s*$/
const BULLET = /^\s*(?:[-*+]|\d+[.)])\s+(.*\S)\s*$/
const CHECKBOX = /^\[[ xX]\]\s+/
const WRAPPED = /^(\*\*|__)(.+)\1$/

function clean(text: string): string {
  let t = text.trim().replace(CHECKBOX, '')
  const m = WRAPPED.exec(t)
  if (m) t = m[2].trim()
  return t
}

export function formatSectionsAsMarkdown(sections: TaskSection[], withPreamble = true): string {
  const body = sections
    .map((s) => [`## ${s.name}`, ...s.tasks.map((t) => `- ${t}`)].join('\n'))
    .join('\n\n')
  return withPreamble ? `${LLM_PREAMBLE}\n\n${body}\n` : `${body}\n`
}

/**
 * Forgiving parse of LLM-style Markdown: headings start sections, list items become tasks,
 * everything else (prose, code fences) is ignored. Bullets before any heading go in an unnamed
 * leading section, named "Section N" by position. Sections without tasks are dropped.
 */
export function parseMarkdownSections(markdown: string): TaskSection[] {
  const result: { name: string | null; tasks: string[] }[] = []
  let current: { name: string | null; tasks: string[] } | null = null

  for (const line of markdown.split(/\r?\n/)) {
    const heading = HEADING.exec(line)
    if (heading) {
      current = { name: clean(heading[1]), tasks: [] }
      result.push(current)
      continue
    }
    const bullet = BULLET.exec(line)
    if (bullet) {
      const task = clean(bullet[1])
      if (!task) continue
      if (!current) {
        current = { name: null, tasks: [] }
        result.push(current)
      }
      current.tasks.push(task)
    }
  }

  const stamp = Date.now()
  return result
    .filter((s) => s.tasks.length > 0)
    .map((s, i) => ({
      id: `section-${stamp}-${i}`,
      name: s.name || `Section ${i + 1}`,
      tasks: s.tasks,
    }))
}
