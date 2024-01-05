// @ts-nocheck

import { it, describe, expect } from 'vitest'
import { remove } from './remove'

const arrayExample = ['0', 1, { value: 2 }, '3']
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

describe("remove test", () => {

   it('should throw if the provided object is not an array or object', () => {
      expect(() => remove(true)).toThrow()
      expect(() => remove(1)).toThrow()
      expect(() => remove('str')).toThrow()
      expect(() => remove(new Date())).toThrow()
      expect(() => remove(null)).toThrow()
      expect(() => remove()).toThrow()
   })

   it('should accept only objects and arrays', () => {
      expect(() => remove(arrayExample)).not.toThrow()
      expect(() => remove(objectExample)).not.toThrow()
   })

   it('should remove props from the object', () => {
      expect(remove(objectExample)).toEqual(objectExample)
      expect(remove(objectExample, '$$non_existen_property')).toEqual(objectExample)
      expect(remove(objectExample, 1)).toEqual(objectExample)
      expect(remove(objectExample, 'name')).not.toHaveProperty('name')
      expect(remove(objectExample, 'name')).toSatisfy((newValue) => newValue.data === objectExample.data)
      expect(remove(objectExample, 'name')).toSatisfy((newValue) => Object.keys(newValue).length === Object.keys(objectExample).length - 1)
      expect(remove(objectExample, ['data', 'name'])).not.toHaveProperty(['data', 'name'])
      expect(remove(objectExample, ['data', 'name'])).toSatisfy((newValue) => newValue.tuple === objectExample.tuple)
      expect(remove(objectExample, ['data', 'name'])).toSatisfy((newValue) => Object.keys(newValue).length === Object.keys(objectExample).length - 2)
   })

   it('should remove indexes from array', () => {
      expect(remove(arrayExample)).toEqual(arrayExample)
      expect(remove(arrayExample, '$$non_existen_property')).toEqual(arrayExample)
      expect(remove(arrayExample, 100)).toEqual(arrayExample)
      expect(remove(arrayExample, '1')).toSatisfy((newArray) => newArray[1] === arrayExample[2])
      expect(remove(arrayExample, 1)).toSatisfy((newArray) => newArray[1] === arrayExample[2])
      expect(remove(arrayExample, '1')).toSatisfy((newValue) => newValue.length === arrayExample.length - 1)

      expect(remove(arrayExample, ['1', '2'])).toSatisfy((newArray) => newArray[1] === arrayExample[3])
      expect(remove(arrayExample, ['1', 2])).toSatisfy((newArray) => newArray[1] === arrayExample[3])
      expect(remove(arrayExample, [2, '1'])).toSatisfy((newArray) => newArray[1] === arrayExample[3])
      expect(remove(arrayExample, [2, '0'])).toSatisfy((newArray) => newArray[0] === arrayExample[1])
      expect(remove(arrayExample, [2, '0'])).toSatisfy((newValue) => newValue.length === arrayExample.length - 2)
   })
})