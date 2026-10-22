// @ts-nocheck
import { it, describe, expect } from 'vitest'
import { s, strict, strictType } from './strict'

const objectExample = { name: 'test object', data: { list: [1, 2] } }

describe("strict test", () => {

   it('should return the same value', () => {
      expect(strict(objectExample)).toBe(objectExample)
      expect(strict(objectExample)).toEqual({ name: 'test object', data: { list: [1, 2] } })
      expect(strict('str')).toBe('str')
      expect(strict(null)).toBe(null)
   })

   it('should be the same function as "s"', () => {
      expect(s).toBe(strict)
   })

})

describe("strictType test", () => {

   it('should return the same value', () => {
      expect(strictType(objectExample)).toBe(objectExample)
      expect(strictType([1, 2])).toEqual([1, 2])
      expect(strictType(undefined)).toBe(undefined)
   })

})
