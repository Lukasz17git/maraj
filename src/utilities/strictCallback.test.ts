import { it, describe, expect } from 'vitest'
import { StrictCallback, unsealStrictCallback } from './strictCallback'

const exampleObject = {
   a: '', b: { b1: '' }, c: [0, 1]
}
const callback: StrictCallback<<T>(v: T) => T> = (s,v) => s(v)
describe("strictCallback test", () => {
   it('should return a tuple where the first value is the value provided', () => {
      expect(unsealStrictCallback(callback)('')).toEqual('')
      expect(unsealStrictCallback(callback)(null)).toEqual(null)
      expect(unsealStrictCallback(callback)(undefined)).toEqual(undefined)
      expect(unsealStrictCallback(callback)(true)).toEqual(true)
      expect(unsealStrictCallback(callback)(exampleObject)).toEqual(exampleObject)
   })
})