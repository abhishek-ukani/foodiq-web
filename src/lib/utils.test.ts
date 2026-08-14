import { describe, expect, it } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('drops falsy values', () => {
    const isB = false
    expect(cn('a', isB && 'b', undefined, null, 'c')).toBe('a c')
  })

  it('lets a later Tailwind class win over a conflicting earlier one', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })
})
