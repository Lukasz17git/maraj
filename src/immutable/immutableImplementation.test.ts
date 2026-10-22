// @ts-nocheck
import { it, describe, expect, vi } from 'vitest'
import { update, experimental_extendableUpdate } from './immutableImplementation'
import { set } from './set'

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

/* any write to a frozen object throws in strict mode, so a mutation fails the test */
const deepFreeze = (value) => {
   Object.values(value).forEach((v) => typeof v === 'object' && v !== null && deepFreeze(v))
   return Object.freeze(value)
}
const frozenObjectExample = deepFreeze(structuredClone(objectExample))
const frozenArrayExample = deepFreeze(structuredClone(arrayExample))

describe("update test", () => {
   it('should throw if a provided path doesnt exist', () => {
      expect(() => update(true)).toThrow()
      expect(() => update(1)).toThrow()
      expect(() => update('str')).toThrow()
      expect(() => update(new Date())).toThrow()
      expect(() => update(null)).toThrow()
      expect(() => update()).toThrow()
   })

   it('should throw if the state is not an object literal or array', () => {
      expect(() => update(new Map(), {})).toThrow()
      expect(() => update(new Set(), {})).toThrow()
      expect(() => update(new (class User { })(), {})).toThrow()
      expect(() => update(Object.create(null), {})).toThrow()
      expect(() => update(() => { }, {})).toThrow()
   })

   it('should throw if the update object is not an object literal', () => {
      expect(() => update(objectExample)).toThrow()
      expect(() => update(objectExample, null)).toThrow()
      expect(() => update(objectExample, 'name')).toThrow()
      expect(() => update(objectExample, [])).toThrow()
      expect(() => update(objectExample, ['name'])).toThrow()
      expect(() => update(objectExample, new Map([['name', 'new']]))).toThrow()
   })

   it('should return same copy of the value if empty update object', () => {
      expect(update(objectExample, {})).toEqual(objectExample)
      expect(update(objectExample, {})).toSatisfy((newValue) => newValue.tuple === objectExample.tuple)
      expect(update(arrayExample, {})).toEqual(arrayExample)
      expect(update(arrayExample, {})).toSatisfy((newValue) => newValue[2] === arrayExample[2])
   })

   it('should always return a new reference', () => {
      expect(update(objectExample, {})).not.toBe(objectExample)
      expect(update(arrayExample, {})).not.toBe(arrayExample)
      expect(update(arrayExample, {})).toSatisfy(Array.isArray)
      expect(update(objectExample, { name: objectExample.name })).not.toBe(objectExample)
   })

   it('should never mutate the original state', () => {
      expect(() => update(frozenObjectExample, {
         name: 'new',
         'data.nestedData.deep': 'new',
         'data.arrayExample.0.name': 'new',
         'data.arrayExample': (v) => [...v, { name: 'example 3' }],
         'tuple.1': 'new',
         'nonexistent.nested': 'new',
      })).not.toThrow()
      expect(() => update(frozenArrayExample, { '0': 'new', '2.value': 3, '10': 'new' })).not.toThrow()
      expect(frozenObjectExample).toEqual(objectExample)
      expect(frozenArrayExample).toEqual(arrayExample)
   })

   it('should add new property if the provided path is doesnt exist beforehand', () => {
      expect(update(objectExample, { "nonexistent": 'new' })).toEqual({ ...objectExample, nonexistent: 'new' })
      expect(update(objectExample, { "nonexistent": v => v })).toEqual({ ...objectExample, nonexistent: undefined })
   })

   it('should create the object in the path if it is missing, null or undefined', () => {
      expect(update({}, { "address.city": 'Madrid' })).toEqual({ address: { city: 'Madrid' } })
      expect(update({ address: undefined }, { "address.city": 'Madrid' })).toEqual({ address: { city: 'Madrid' } })
      expect(update({ manager: null }, { "manager.name": 'Ana' })).toEqual({ manager: { name: 'Ana' } })
      expect(update({}, { "orders.0.id": 1 })).toEqual({ orders: [{ id: 1 }] })
   })

   it('should create an array if the next key is an index and an object otherwise', () => {
      const newValue = update({}, { 'files.1.name': 'new' })
      expect(newValue.files).toSatisfy(Array.isArray)
      expect(newValue.files).toHaveLength(2)
      expect(0 in newValue.files).toBe(false)
      expect(newValue.files[1]).toEqual({ name: 'new' })

      expect(update({}, { 'files.01.name': 'new' })).toEqual({ files: { '01': { name: 'new' } } })
      expect(update({}, { 'files.first.name': 'new' })).toEqual({ files: { first: { name: 'new' } } })
      expect(update({ files: {} }, { 'files.1.name': 'new' })).toEqual({ files: { '1': { name: 'new' } } })
      expect(update({}, { 'a.0.b.0': 'new' })).toEqual({ a: [{ b: ['new'] }] })
   })

   it('should replace primitives in the middle of the path by default', () => {
      expect(update({ name: 'str' }, { 'name.first': 'new' })).toEqual({ name: { first: 'new' } })
      expect(update({ count: 0 }, { 'count.value': 1 })).toEqual({ count: { value: 1 } })
      expect(update({ flag: false }, { 'flag.0': 1 })).toEqual({ flag: [1] })
   })

   it('should create a copy with the updated value', () => {
      expect(update(objectExample, { name: 'new' })).toEqual({ ...objectExample, ...{ name: 'new' } })
      expect(update(objectExample, { name: 'new' })).toSatisfy((newValue) => newValue.tuple === objectExample.tuple)
      expect(update(objectExample, { name: v => v.slice(0, 1) })).toEqual({ ...objectExample, ...{ name: objectExample.name.slice(0, 1) } })

      const copy: typeof objectExample = JSON.parse(JSON.stringify(objectExample))
      copy.data.nestedData.deep = 'new'
      expect(update(objectExample, { "data.nestedData.deep": 'new' })).toEqual(copy)
      expect(update(objectExample, { "data.nestedData.deep": 'new' })).toSatisfy((newValue) => newValue.tuple === objectExample.tuple)

      const copy2: typeof objectExample = JSON.parse(JSON.stringify(objectExample))
      copy2.tuple[0] = 'new'
      expect(update(objectExample, { "tuple.0": 'new' })).toEqual(copy2)
      expect(update(objectExample, { "data.nestedData.deep": 'new' })).toSatisfy((newValue) => newValue.tuple === objectExample.tuple)

      const copy3: typeof objectExample = JSON.parse(JSON.stringify(objectExample))
      copy3.data.arrayExample[0].name = 'new'
      expect(update(objectExample, { "data.arrayExample.0.name": 'new' })).toEqual(copy3)
      expect(update(objectExample, { "data.nestedData.deep": 'new' })).toSatisfy((newValue) => newValue.tuple === objectExample.tuple)

      const copy4: typeof objectExample = JSON.parse(JSON.stringify(objectExample))
      copy4.data.arrayExample = [...copy4.data.arrayExample, { name: 'example 3' }]

      expect(update(objectExample, { "data.arrayExample": (v) => [...v, { name: 'example 3' }] })).toEqual(copy4)
      expect(update(objectExample, { "data.nestedData": v => v.deep })).toSatisfy((newValue) => newValue.tuple === objectExample.tuple)

   })

   it('should shallow copy only the objects in the updated path', () => {
      const newValue = update(objectExample, { 'data.arrayExample.0.name': 'new' })
      expect(newValue.data).not.toBe(objectExample.data)
      expect(newValue.data.arrayExample).not.toBe(objectExample.data.arrayExample)
      expect(newValue.data.arrayExample[0]).not.toBe(objectExample.data.arrayExample[0])
      expect(newValue.data.arrayExample[1]).toBe(objectExample.data.arrayExample[1])
      expect(newValue.data.nestedData).toBe(objectExample.data.nestedData)
      expect(newValue.tuple).toBe(objectExample.tuple)
   })

   it('should apply multiple updates sharing the same path', () => {
      const newValue = update(objectExample, {
         'data.nestedData.deep': 'new deep',
         'data.arrayExample.1.name': 'new name',
         'tuple.0': 'new one',
         'tuple.1': 'new two',
      })
      expect(newValue).toEqual({
         ...objectExample,
         data: { nestedData: { deep: 'new deep' }, arrayExample: [{ name: 'example 1' }, { name: 'new name' }] },
         tuple: ['new one', 'new two'],
      })
      expect(newValue.data.arrayExample[0]).toBe(objectExample.data.arrayExample[0])
   })

   it('should apply the updates in the order of the update object', () => {
      expect(update({ data: { x: 1 } }, { 'data.x': 2, data: (v) => ({ ...v, seen: v.x }) })).toEqual({ data: { x: 2, seen: 2 } })
      expect(update({ data: { x: 1 } }, { 'data.x': 2, data: { y: 1 } })).toEqual({ data: { y: 1 } })
      expect(update({ data: { x: 1 } }, { data: { y: 1 }, 'data.x': 2 })).toEqual({ data: { y: 1, x: 2 } })
      expect(update({ list: [1] }, { list: (v) => [...v, 2], 'list.0': 0 })).toEqual({ list: [0, 2] })
   })

   it('should not mutate an object set as new value if a later update goes inside it', () => {
      const newData = { x: 0 }
      const newValue = update({ data: { x: 1 } }, { data: newData, 'data.x': 5 })
      expect(newValue).toEqual({ data: { x: 5 } })
      expect(newData).toEqual({ x: 0 })
      expect(newValue.data).not.toBe(newData)

      const newList = [1, 2]
      expect(update({ list: [] }, { list: newList, 'list.0': 0 })).toEqual({ list: [0, 2] })
      expect(newList).toEqual([1, 2])
   })

   it('should call function updates once with only the current value in the path', () => {
      const updater = vi.fn((v) => v + 1)
      expect(update({ count: 1 }, { count: updater })).toEqual({ count: 2 })
      expect(updater).toHaveBeenCalledTimes(1)
      expect(updater.mock.calls[0]).toEqual([1])

      const nestedUpdater = vi.fn((v) => v)
      update(objectExample, { 'data.nestedData': nestedUpdater })
      expect(nestedUpdater.mock.calls[0][0]).toEqual(objectExample.data.nestedData)

      const missingUpdater = vi.fn(() => 'new')
      expect(update({}, { 'a.b': missingUpdater })).toEqual({ a: { b: 'new' } })
      expect(missingUpdater.mock.calls[0]).toEqual([undefined])
   })

   it('should set functions as values only through "set"', () => {
      const callback = () => 'callback result'
      expect(update({ onClick: null }, { onClick: set(callback) }).onClick).toBe(callback)
      expect(update({ onClick: null }, { onClick: callback }).onClick).toBe('callback result')
   })

   it('should set falsy values', () => {
      expect(update({ a: 1 }, { a: undefined })).toSatisfy((newValue) => Object.hasOwn(newValue, 'a') && newValue.a === undefined)
      expect(update({ a: 1 }, { a: null })).toEqual({ a: null })
      expect(update({ a: 1 }, { a: 0 })).toEqual({ a: 0 })
      expect(update({ a: 1 }, { a: '' })).toEqual({ a: '' })
      expect(update({ a: 1 }, { a: false })).toEqual({ a: false })
      expect(update({ a: 1 }, { a: NaN })).toEqual({ a: NaN })
   })

   it('should update arrays as state', () => {
      expect(update(arrayExample, { '0': 'new' })).toEqual(['new', 1, { value: 2 }, '3'])
      expect(update(arrayExample, { 1: (v) => v + 1 })).toEqual(['0', 2, { value: 2 }, '3'])
      expect(update(arrayExample, { '2.value': 3 })).toEqual(['0', 1, { value: 3 }, '3'])
      expect(update(arrayExample, { '0': 'new' })).toSatisfy((newValue) => newValue[2] === arrayExample[2])
      expect(update(arrayExample, { '2.value': 3 })).toSatisfy((newValue) => newValue[2] !== arrayExample[2])
      expect(update(arrayExample, { '4': 'new' })).toHaveLength(5)
   })

   it('should skip the empty path', () => {
      expect(update(objectExample, { '': 'new' })).toEqual(objectExample)
      expect(update(objectExample, { '': 'new', name: 'new' })).toEqual({ ...objectExample, name: 'new' })
   })

   it('should ignore symbol keys in the update object', () => {
      expect(update({ a: 1 }, { [Symbol('a')]: 2 })).toEqual({ a: 1 })
   })

   it('should update keys containing dots if they exist beforehand', () => {
      expect(update({ 'a.b.c.d': 1 }, { 'a.b.c.d': 2 })).toEqual({ 'a.b.c.d': 2 })
      expect(update({ a: { 'b.c.d': 1 } }, { 'a.b.c.d': 2 })).toEqual({ a: { 'b.c.d': 2 } })
      expect(update({ a: { b: { 'c.d': 1 } } }, { 'a.b.c.d': 2 })).toEqual({ a: { b: { 'c.d': 2 } } })
      expect(update({ a: { b: { c: { d: 1 } } } }, { 'a.b.c.d': 2 })).toEqual({ a: { b: { c: { d: 2 } } } })
   })

   it('should not go inside objects in keys containing dots', () => {
      expect(update({ a: { 'b.c': { d: 1 } } }, { 'a.b.c': 2 })).toEqual({ a: { 'b.c': 2 } })
      expect(update({ a: { 'b.c': { d: 1 } } }, { 'a.b.c.d': 2 })).toEqual({ a: { 'b.c': { d: 1 }, b: { c: { d: 2 } } } })
   })

   it('should throw if a key in the path is "__proto__"', () => {
      expect(() => update({}, { '__proto__.polluted': 'yes' })).toThrow()
      expect(() => update({}, { 'a.__proto__': 'yes' })).toThrow()
      expect(() => update({}, JSON.parse('{ "__proto__": { "polluted": "yes" } }'))).toThrow()
   })

   it('should not change Object.prototype', () => {
      const descriptor = Object.getOwnPropertyDescriptor(Object.prototype, 'toLocaleString')
      try {
         update({}, { 'constructor.prototype.polluted': 'yes' })
         update({}, { 'constructor.prototype.toLocaleString': 'new' })
         expect({}.polluted).toBe(undefined)
         expect(Object.hasOwn(Object.prototype, 'polluted')).toBe(false)
         expect(Object.prototype.toLocaleString).toBe(descriptor.value)
      } finally {
         Object.defineProperty(Object.prototype, 'toLocaleString', descriptor)
      }
   })

   it('should create props named like Object.prototype methods', () => {
      expect(update({}, { 'toString.value': 'new' })).toEqual({ toString: { value: 'new' } })
      expect(update({}, { 'constructor.prototype.polluted': 'yes' })).toEqual({ constructor: { prototype: { polluted: 'yes' } } })
      expect(update({}, { toString: (v) => v })).toSatisfy((newValue) => Object.hasOwn(newValue, 'toString') && newValue.toString === undefined)
      expect(update({ a: 1 }, { 'hasOwnProperty.x': 1 })).toEqual({ a: 1, hasOwnProperty: { x: 1 } })
   })

})

describe("update options test", () => {

   it("should add new props and indexes by default and with 'add'", () => {
      const options = { onNewProps: 'add', onNewIndexes: 'add', onPathsIntersectedByPrimitiveValues: 'add' }
      expect(update({ list: [1] }, { a: 1, 'b.c': 2, 'list.2': 3 })).toEqual({ a: 1, b: { c: 2 }, list: [1, undefined, 3] })
      expect(update({ list: [1] }, { a: 1, 'b.c': 2, 'list.2': 3 }, options)).toEqual({ a: 1, b: { c: 2 }, list: [1, undefined, 3] })
      expect(update({ name: 'str' }, { 'name.first': 'new' }, options)).toEqual({ name: { first: 'new' } })
   })

   it("should throw on new props with onNewProps: 'error'", () => {
      const options = { onNewProps: 'error' }
      expect(() => update(objectExample, { nonexistent: 'new' }, options)).toThrow()
      expect(() => update(objectExample, { 'data.nonexistent': 'new' }, options)).toThrow()
      expect(() => update(objectExample, { 'nonexistent.nested': 'new' }, options)).toThrow()
      expect(() => update({}, { 'orders.0.id': 1 }, options)).toThrow()
      expect(() => update(objectExample, { name: 'new', 'data.nestedData.deep': 'new' }, options)).not.toThrow()
      expect(() => update({ a: undefined }, { a: 'new' }, options)).not.toThrow()
   })

   it("should skip only the update with new props with onNewProps: 'skip'", () => {
      const options = { onNewProps: 'skip' }
      expect(update(objectExample, { nonexistent: 'new' }, options)).toEqual(objectExample)
      expect(update(objectExample, { nonexistent: 'new', name: 'new' }, options)).toEqual({ ...objectExample, name: 'new' })
      expect(update(objectExample, { 'data.nonexistent': 'new' }, options)).toEqual(objectExample)
   })

   it("should throw on new indexes with onNewIndexes: 'error'", () => {
      const options = { onNewIndexes: 'error' }
      expect(() => update(objectExample, { 'data.arrayExample.2': { name: 'new' } }, options)).toThrow()
      expect(() => update(objectExample, { 'data.arrayExample.100.name': 'new' }, options)).toThrow()
      expect(() => update(arrayExample, { '4': 'new' }, options)).toThrow()
      expect(() => update(objectExample, { 'data.arrayExample.1.name': 'new' }, options)).not.toThrow()
   })

   it("should skip only the update with new indexes with onNewIndexes: 'skip'", () => {
      const options = { onNewIndexes: 'skip' }
      expect(update(arrayExample, { '4': 'new' }, options)).toEqual(arrayExample)
      expect(update(arrayExample, { '4': 'new', '0': 'new' }, options)).toEqual(['new', 1, { value: 2 }, '3'])
      expect(update(objectExample, { 'data.arrayExample.2': { name: 'new' } }, options)).toEqual(objectExample)
   })

   it("should use onNewProps for string keys in arrays and index keys in objects", () => {
      expect(() => update({ list: [1] }, { 'list.first': 1 }, { onNewProps: 'error' })).toThrow()
      expect(() => update({ list: [1] }, { 'list.first': 1 }, { onNewIndexes: 'error' })).not.toThrow()
      expect(() => update({ map: {} }, { 'map.0': 1 }, { onNewProps: 'error' })).toThrow()
      expect(() => update({ map: {} }, { 'map.0': 1 }, { onNewIndexes: 'error' })).not.toThrow()
   })

   it("should throw on primitives in the path with onPathsIntersectedByPrimitiveValues: 'error'", () => {
      const options = { onPathsIntersectedByPrimitiveValues: 'error' }
      expect(() => update({ name: 'str' }, { 'name.first': 'new' }, options)).toThrow()
      expect(() => update({ count: 0 }, { 'count.value': 1 }, options)).toThrow()
      expect(() => update({ manager: null }, { 'manager.name': 'Ana' }, options)).toThrow()
      expect(() => update({ manager: undefined }, { 'manager.name': 'Ana' }, options)).not.toThrow()
      expect(() => update({}, { 'manager.name': 'Ana' }, options)).not.toThrow()
   })

   it("should skip only the update with a primitive in the path with onPathsIntersectedByPrimitiveValues: 'skip'", () => {
      const options = { onPathsIntersectedByPrimitiveValues: 'skip' }
      expect(update({ name: 'str' }, { 'name.first': 'new' }, options)).toEqual({ name: 'str' })
      expect(update({ name: 'str', a: 1 }, { 'name.first': 'new', a: 2 }, options)).toEqual({ name: 'str', a: 2 })
      expect(update({ a: { b: 1 } }, { 'a.b.c': 'new', 'a.d': 2 }, options)).toEqual({ a: { b: 1, d: 2 } })
      expect(update({ manager: null }, { 'manager.name': 'Ana' }, options)).toEqual({ manager: null })
   })

   it("should skip only the update with a new prop or index in the middle of the path", () => {
      expect(update({}, { 'a.b.c': 1 }, { onNewProps: 'skip' })).toEqual({})
      expect(update({ a: { d: 1 } }, { 'a.b.c': 1, 'a.d': 2 }, { onNewProps: 'skip' })).toEqual({ a: { d: 2 } })
      expect(update({ list: [] }, { 'list.0.name': 'new' }, { onNewIndexes: 'skip' })).toEqual({ list: [] })
      expect(update({ list: [{ id: 1 }] }, { 'list.1.id': 2, 'list.0.id': 0 }, { onNewIndexes: 'skip' })).toEqual({ list: [{ id: 0 }] })
   })

})

describe("experimental_extendableUpdate test", () => {

   it('should throw on the same wrong types as update', () => {
      expect(() => experimental_extendableUpdate(null, {})).toThrow()
      expect(() => experimental_extendableUpdate(new Date(), {})).toThrow()
      expect(() => experimental_extendableUpdate(objectExample, null)).toThrow()
      expect(() => experimental_extendableUpdate(objectExample, [])).toThrow()
   })

   it('should update and add new props like update', () => {
      const updates = { name: 'new', 'data.arrayExample.0.name': 'new', 'newProp.nested': 'new', 'files.1.name': 'new' }
      expect(experimental_extendableUpdate(objectExample, updates)).toEqual(update(objectExample, updates))
      expect(experimental_extendableUpdate(objectExample, updates)).toSatisfy((newValue) => newValue.tuple === objectExample.tuple)
   })

   it('should always add new props and indexes, ignoring options', () => {
      expect(experimental_extendableUpdate({ list: [] }, { a: 1, 'list.0': 1 }, { onNewProps: 'error', onNewIndexes: 'error' })).toEqual({ a: 1, list: [1] })
   })

})
