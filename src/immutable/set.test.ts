// @ts-nocheck
import { it, describe, expect } from 'vitest'
import { set } from './set'

describe("set test", () => {

   it('should return a function', () => {
      expect(set('new')).toBeTypeOf('function')
   })

   it('should return the same value, ignoring the current one', () => {
      const newValue = { name: 'new' }
      expect(set(newValue)()).toBe(newValue)
      expect(set(newValue)({ name: 'old' })).toBe(newValue)
      expect(set(undefined)('old')).toBe(undefined)
      expect(set(null)('old')).toBe(null)
      expect(set(0)(1)).toBe(0)
   })

   it('should return a function as value without calling it', () => {
      const callback = () => 'callback result'
      expect(set(callback)()).toBe(callback)
   })

})
