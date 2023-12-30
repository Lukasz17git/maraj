//@ts-nocheck
import { it, describe, expect } from 'vitest'
import { select } from './select'

const objectExample = {
   name: 'test object',
   testingPurpose: true,
   data: {
      nestedData: {
         deep: 'this is deep field'
      },
      arrayExample: [{ name: 'example 1' }, { name: 'example 2' }]
   },
   tuple: ['one', 'two'] as [string, string]
}

describe("select test", () => {
   it('should throw an error if the path is not a string', () => {
      expect(() => select(objectExample, true)).toThrow()
      expect(() => select(objectExample, 1)).toThrow()
      expect(() => select(objectExample, new Date())).toThrow()
      expect(() => select(objectExample, null)).toThrow()
      expect(() => select(objectExample)).toThrow()
   })

   it('should return same value if the path is an empty string', () => {
      expect(select(objectExample, '')).toBe(objectExample)
   })

   it('should return undefined if the path is an invalid path', () => {
      expect(select(objectExample, '$$non_existen_property')).toBe(undefined)
      expect(select(objectExample, 'data.arrayExample.100.name')).toBe(undefined)
      expect(select(objectExample, 'data.arrayExample.0.$$non_existent_prop')).toBe(undefined)
   })

   it('should return the value in the path', () => {
      expect(select(objectExample, 'data')).toBe(objectExample.data)
      expect(select(objectExample, 'data.arrayExample')).toBe(objectExample.data.arrayExample)
      expect(select(objectExample, 'data.arrayExample.0.name')).toBe(objectExample.data.arrayExample[0].name)
      expect(select(objectExample, 'tuple.0')).toBe(objectExample.tuple[0])
   })

})