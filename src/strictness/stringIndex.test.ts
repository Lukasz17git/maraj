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
      expect(isStringIndex('+1')).toBe(false)
      expect(isStringIndex('-0')).toBe(false)
      expect(isStringIndex('0x10')).toBe(false)
      expect(isStringIndex('1_000')).toBe(false)
      expect(isStringIndex('Infinity')).toBe(false)
      expect(isStringIndex('a')).toBe(false)
      expect(isStringIndex('9007199254740993')).toBe(false)
   })

   it('should return true for all indexable strings', () => {
      expect(isStringIndex('0')).toBe(true)
      expect(isStringIndex('1')).toBe(true)
      expect(isStringIndex('10')).toBe(true)
      expect(isStringIndex('999999')).toBe(true)
      expect(isStringIndex('9007199254740991')).toBe(true)
   })

   it("should return false for 'NaN'", () => {
      expect(isStringIndex('NaN')).toBe(false)
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
      expect(parseStringIndex('+1')).toBe(null)
      expect(parseStringIndex('-0')).toBe(null)
      expect(parseStringIndex('0x10')).toBe(null)
      expect(parseStringIndex('Infinity')).toBe(null)
      expect(parseStringIndex('9007199254740993')).toBe(null)
   })

   it('should return true for all indexable strings', () => {
      expect(parseStringIndex('0')).toBe(0)
      expect(parseStringIndex('1')).toBe(1)
      expect(parseStringIndex('11')).toBe(11)
      expect(parseStringIndex('123')).toBe(123)
      expect(parseStringIndex('9007199254740991')).toBe(9007199254740991)
   })

   it("should return null for 'NaN'", () => {
      expect(parseStringIndex('NaN')).toBe(null)
   })
})