import { it, describe, expect } from 'vitest'
import { strictCallback } from './strictCallback'

const exampleObject = {
   a: '', b: { b1: '' }, c: [0, 1]
}

describe("strictCallback test", () => {
   it('should return a tuple where the first value is the value provided', () => {
      expect(strictCallback('')[0]).toEqual('')
      expect(strictCallback(null)[0]).toEqual(null)
      expect(strictCallback(undefined)[0]).toEqual(undefined)
      expect(strictCallback(true)[0]).toEqual(true)
      expect(strictCallback(exampleObject)[0]).toEqual(exampleObject)
   })
})