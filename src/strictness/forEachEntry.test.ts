import { it, describe, expect, vi } from 'vitest'
import { forEachEntry } from './forEachEntry'

describe("forEachEntry test", () => {

   it('should call the callback with every key', () => {
      let result = ''
      expect(forEachEntry({ a: '1', b: '2' }, (key, value) => {
         result = result + key
      })).toSatisfy(() => result === 'ab')
   })

   it('should call the callback with every value', () => {
      let result = ''
      expect(forEachEntry({ a: '1', b: '2' }, (key, value) => {
         result = result + value
      })).toSatisfy(() => result === '12')
   })

   it('should call the callback once per entry with key and value', () => {
      const callback = vi.fn()
      forEachEntry({ a: 1, b: { c: 2 } }, callback)
      expect(callback).toHaveBeenCalledTimes(2)
      expect(callback.mock.calls).toEqual([['a', 1], ['b', { c: 2 }]])
   })

   it('should not call the callback for an empty object', () => {
      const callback = vi.fn()
      forEachEntry({}, callback)
      expect(callback).not.toHaveBeenCalled()
   })

   it('should return undefined', () => {
      expect(forEachEntry({ a: 1 }, () => 'ignored')).toBe(undefined)
   })

   it('should follow the order of Object.keys, numeric keys first', () => {
      const keys: string[] = []
      forEachEntry({ b: 1, 2: 1, a: 1, 1: 1 }, (key) => { keys.push(String(key)) })
      expect(keys).toEqual(['1', '2', 'b', 'a'])
   })

   it('should skip symbol, non-enumerable and inherited keys', () => {
      const object = Object.create({ inherited: 1 })
      object.own = 1
      object[Symbol('symbol')] = 1
      Object.defineProperty(object, 'hidden', { value: 1, enumerable: false })
      const callback = vi.fn()
      forEachEntry(object, callback)
      expect(callback.mock.calls).toEqual([['own', 1]])
   })

})
