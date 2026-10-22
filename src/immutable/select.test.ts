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

   it('should return undefined if an object in the path is null or undefined', () => {
      expect(select({ manager: null }, 'manager.name')).toBe(undefined)
      expect(select({ manager: undefined }, 'manager.name')).toBe(undefined)
      expect(select({ a: { b: undefined } }, 'a.b.c.d')).toBe(undefined)
      expect(select({ manager: null }, 'manager')).toBe(null)
   })

   it('should return the value in the path', () => {
      expect(select(objectExample, 'data')).toBe(objectExample.data)
      expect(select(objectExample, 'data.arrayExample')).toBe(objectExample.data.arrayExample)
      expect(select(objectExample, 'data.arrayExample.0.name')).toBe(objectExample.data.arrayExample[0].name)
      expect(select(objectExample, 'tuple.0')).toBe(objectExample.tuple[0])
   })

   it('should return falsy values in the path', () => {
      expect(select({ a: 0 }, 'a')).toBe(0)
      expect(select({ a: '' }, 'a')).toBe('')
      expect(select({ a: false }, 'a')).toBe(false)
      expect(select({ a: { b: null } }, 'a.b')).toBe(null)
      expect(select({ a: [undefined] }, 'a.0')).toBe(undefined)
   })

   it('should return the value in the path of an array', () => {
      const arrayExample = ['0', 1, { value: 2 }]
      expect(select(arrayExample, '0')).toBe('0')
      expect(select(arrayExample, '2.value')).toBe(2)
      expect(select(arrayExample, '3')).toBe(undefined)
      expect(select(arrayExample, '')).toBe(arrayExample)
   })

   it('should return undefined if the state is null or undefined', () => {
      expect(select(null, 'a')).toBe(undefined)
      expect(select(undefined, 'a.b')).toBe(undefined)
      expect(select(null, '')).toBe(null)
   })

   it('should return undefined if a primitive or a non-literal object is in the path', () => {
      expect(select({ a: 5 }, 'a.b')).toBe(undefined)
      expect(select({ a: true }, 'a.b.c')).toBe(undefined)
      expect(select({ map: new Map([['key', 1]]) }, 'map.key')).toBe(undefined)
   })

   it('should not return inherited props', () => {
      expect(select({}, 'toString')).toBe(undefined)
      expect(select({}, '__proto__')).toBe(undefined)
      expect(select({}, 'constructor.prototype')).toBe(undefined)
      expect(select({ a: {} }, 'a.hasOwnProperty')).toBe(undefined)
      expect(select(Object.create({ inherited: 1 }), 'inherited')).toBe(undefined)
   })

   it('should return the value of keys containing dots, before nested keys', () => {
      expect(select({ 'a.b.c': 1 }, 'a.b.c')).toBe(1)
      expect(select({ a: { 'b.c': 1 } }, 'a.b.c')).toBe(1)
      expect(select({ a: { b: { c: 1 } } }, 'a.b.c')).toBe(1)
      expect(select({ 'a.b': 1, a: { b: 2 } }, 'a.b')).toBe(1)
      expect(select({ a: { 'b.c': { d: 1 } } }, 'a.b.c.d')).toBe(undefined)
   })

   it('should return the same reference, not a copy', () => {
      expect(select(objectExample, 'data.nestedData')).toBe(objectExample.data.nestedData)
      expect(select(objectExample, 'tuple')).toBe(objectExample.tuple)
   })

})