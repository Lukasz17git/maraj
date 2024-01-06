// @ts-nocheck

import { it, describe, expect } from 'vitest'
import { parseStringIndex, isStringIndex } from './stringIndex'

describe("isStringIndex test", () => {

   it('should return false for all non-integer/non-indexable strings', () => {
      expect(isStringIndex('')).toBe(false)
      expect(isStringIndex(' ')).toBe(false)
      expect(isStringIndex(' 0')).toBe(false)
      expect(isStringIndex(' 1')).toBe(false)
      expect(isStringIndex('0 ')).toBe(false)
      expect(isStringIndex('1 ')).toBe(false)
      expect(isStringIndex(' 0 ')).toBe(false)
      expect(isStringIndex(' 1 ')).toBe(false)
      expect(isStringIndex('00')).toBe(false)
      expect(isStringIndex('01')).toBe(false)
      expect(isStringIndex('1.')).toBe(false)
      expect(isStringIndex('0.')).toBe(false)
      expect(isStringIndex('0.0')).toBe(false)
      expect(isStringIndex('1e')).toBe(false)
      expect(isStringIndex('1e0')).toBe(false)
      expect(isStringIndex('1e-0')).toBe(false)
      expect(isStringIndex('1E')).toBe(false)
      expect(isStringIndex('1E0')).toBe(false)
      expect(isStringIndex('1E-0')).toBe(false)
      expect(isStringIndex('1f')).toBe(false)
   })

   it('should return true for all indexable strings', () => {
      expect(isStringIndex('0')).toBe(true)
      expect(isStringIndex('1')).toBe(true)
   })

})

describe("parseStringIndex test", () => {

   it('should return null for all non integer strings', () => {
      expect(parseStringIndex('')).toBe(null)
      expect(parseStringIndex(' ')).toBe(null)
      expect(parseStringIndex(' 0')).toBe(null)
      expect(parseStringIndex(' 1')).toBe(null)
      expect(parseStringIndex('0 ')).toBe(null)
      expect(parseStringIndex('1 ')).toBe(null)
      expect(parseStringIndex(' 0 ')).toBe(null)
      expect(parseStringIndex(' 1 ')).toBe(null)
      expect(parseStringIndex('00')).toBe(null)
      expect(parseStringIndex('01')).toBe(null)
      expect(parseStringIndex('1.')).toBe(null)
      expect(parseStringIndex('0.')).toBe(null)
      expect(parseStringIndex('0.0')).toBe(null)
      expect(parseStringIndex('1e')).toBe(null)
      expect(parseStringIndex('1e0')).toBe(null)
      expect(parseStringIndex('1e-0')).toBe(null)
      expect(parseStringIndex('1E')).toBe(null)
      expect(parseStringIndex('1E0')).toBe(null)
      expect(parseStringIndex('1E-0')).toBe(null)
      expect(parseStringIndex('1f')).toBe(null)
   })

   it('should return true for all indexable strings', () => {
      expect(parseStringIndex('0')).toBe(0)
      expect(parseStringIndex('1')).toBe(1)
      expect(parseStringIndex('11')).toBe(11)
      expect(parseStringIndex('123')).toBe(123)
   })
})