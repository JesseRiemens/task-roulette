import { describe, it, expect } from 'vitest'
import { SpinEngine } from './spin-engine'
import type { TaskSection } from '@/types/section'

const section = (id: string, n: number): TaskSection =>
  ({ id, name: id, tasks: Array.from({ length: n }, (_, i) => `t${i}`) }) as unknown as TaskSection

describe('SpinEngine', () => {
  it('skips empty sections', () => {
    expect(SpinEngine.calculateSpinConfigs([section('a', 0), section('b', 3)]).map((c) => c.sectionId)).toEqual(['b'])
  })

  it.each([1, 2, 3, 7, 50, 500])('walk from startIndex lands on finalSelection (n=%i)', (n) => {
    for (let run = 0; run < 200; run++) {
      const [c] = SpinEngine.calculateSpinConfigs([section('a', n)])
      let idx = c.startIndex
      for (let s = 0; s < c.totalSteps; s++) idx = SpinEngine.getNextIndex(idx, c.taskCount)
      expect(idx).toBe(c.finalSelection)
      expect(c.startIndex).toBeGreaterThanOrEqual(0)
      expect(c.startIndex).toBeLessThan(n)
    }
  })

  it('caps steps for large lists', () => {
    for (let run = 0; run < 100; run++) {
      expect(SpinEngine.calculateSpinConfigs([section('a', 1000)])[0].totalSteps).toBeLessThanOrEqual(36)
    }
  })

  it('total spin time stays bounded and delays never shrink while slowing down', () => {
    const steps = 36
    let total = 0
    let prev = 0
    for (let s = 0; s < steps; s++) {
      const d = SpinEngine.calculateStepDelay(s, steps)
      expect(d).toBeGreaterThanOrEqual(prev)
      prev = d
      total += d
    }
    expect(total).toBeLessThan(4500)
  })
})
