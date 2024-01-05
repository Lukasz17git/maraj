//@ts-nocheck
import { it, describe, expect } from 'vitest'
import { splitPathAtLastKey } from './splitPathAtLastKey'

describe("splitPathAtLastKey test", () => {
   it('should throw if the provided object is not an array or object', () => {
      expect(() => splitPathAtLastKey(true)).toThrow()
      expect(() => splitPathAtLastKey(1)).toThrow()
      expect(() => splitPathAtLastKey({})).toThrow()
      expect(() => splitPathAtLastKey([])).toThrow()
      expect(() => splitPathAtLastKey(new Date())).toThrow()
      expect(() => splitPathAtLastKey(null)).toThrow()
      expect(() => splitPathAtLastKey()).toThrow()
   })

   it('should return RemainingPath and LastKey', () => {
      expect(splitPathAtLastKey('')).toEqual(['', ''])
      expect(splitPathAtLastKey('data')).toEqual(['', 'data'])
      expect(splitPathAtLastKey('data.country.city')).toEqual(['data.country', 'city'])
      expect(splitPathAtLastKey('data.files.1')).toEqual(['data.files', '1'])
      expect(splitPathAtLastKey('data.files.1.id')).toEqual(['data.files.1', 'id'])
   })
})