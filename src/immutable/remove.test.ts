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

   it('should throw if the provided value is a non-literal object', () => {
      expect(() => remove(new Map(), 'a')).toThrow()
      expect(() => remove(new (class User { })(), 'a')).toThrow()
      expect(() => remove(Object.create(null), 'a')).toThrow()
   })

   it('should always return a new reference without mutating the original', () => {
      const frozenObject = Object.freeze({ a: 1, b: 2 })
      const frozenArray = Object.freeze([1, 2, 3])
      expect(remove(frozenObject, 'a')).toEqual({ b: 2 })
      expect(remove(frozenArray, 0)).toEqual([2, 3])
      expect(frozenObject).toEqual({ a: 1, b: 2 })
      expect(frozenArray).toEqual([1, 2, 3])
      expect(remove(objectExample, [])).not.toBe(objectExample)
      expect(remove(arrayExample, [])).not.toBe(arrayExample)
   })

   it('should keep the type of the value', () => {
      expect(remove(arrayExample, 0)).toSatisfy(Array.isArray)
      expect(remove({ 0: 'a', 1: 'b' }, 0)).toSatisfy((newValue) => !Array.isArray(newValue))
   })

   it('should remove numeric and symbol keys from the object', () => {
      const symbol = Symbol('key')
      expect(remove({ 1: 'a', b: 2 }, 1)).toEqual({ b: 2 })
      expect(remove({ 1: 'a', b: 2 }, '1')).toEqual({ b: 2 })
      expect(remove({ [symbol]: 1, a: 1 }, symbol)).toSatisfy((newValue) => !(symbol in newValue) && newValue.a === 1)
   })

   it('should remove each index only once and ignore invalid indexes', () => {
      expect(remove([1, 2, 3], [1, 1])).toEqual([1, 3])
      expect(remove([1, 2, 3], [1, '1'])).toEqual([1, 3])
      expect(remove([1, 2, 3], -1)).toEqual([1, 2, 3])
      expect(remove([1, 2, 3], 1.5)).toEqual([1, 2, 3])
      expect(remove([], 0)).toEqual([])
   })

   it('should keep the values equal to the removed ones', () => {
      expect(remove([1, 1, 1], 1)).toEqual([1, 1])
      expect(remove([undefined, null, undefined], 0)).toEqual([null, undefined])
   })
})