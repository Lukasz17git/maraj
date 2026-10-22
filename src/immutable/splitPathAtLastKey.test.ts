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
      expect(() => splitPathAtLastKey(new String('data.files'))).toThrow()
   })

   it('should return RemainingPath and LastKey', () => {
      expect(splitPathAtLastKey('')).toEqual(['', ''])
      expect(splitPathAtLastKey('data')).toEqual(['', 'data'])
      expect(splitPathAtLastKey('data.country.city')).toEqual(['data.country', 'city'])
      expect(splitPathAtLastKey('data.files.1')).toEqual(['data.files', '1'])
      expect(splitPathAtLastKey('data.files.1.id')).toEqual(['data.files.1', 'id'])
   })

   it('should split only at the last dot', () => {
      expect(splitPathAtLastKey('.')).toEqual(['', ''])
      expect(splitPathAtLastKey('data.')).toEqual(['data', ''])
      expect(splitPathAtLastKey('.data')).toEqual(['', 'data'])
      expect(splitPathAtLastKey('data..id')).toEqual(['data.', 'id'])
      expect(splitPathAtLastKey('..')).toEqual(['.', ''])
   })

   it('should give back the same path joining both parts with a dot', () => {
      const paths = ['data.country.city', 'data.files.1', 'a.b', 'data..id', '.data', 'data.']
      paths.forEach((path) => expect(splitPathAtLastKey(path).join('.')).toBe(path))
   })
})