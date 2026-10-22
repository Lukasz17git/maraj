// @ts-nocheck
/*
 * Variation 1: table-driven tests
 * Each behavior is a table of cases run with it.each / describe.each, so adding a case is adding a row.
 */
import { it, describe, expect } from 'vitest'
import { update, experimental_extendableUpdate } from '../src/immutable/immutableImplementation'
import { select } from '../src/immutable/select'
import { set } from '../src/immutable/set'

const callback = () => 'callback result'

const objectExample = {
   name: 'test object',
   testingPurpose: true,
   data: {
      nestedData: { deep: 'this is deep field' },
      arrayExample: [{ name: 'example 1' }, { name: 'example 2' }]
   },
   tuple: ['one', 'two']
}

/**
 * --------------------------------------------
 *  WRONG TYPES
 * --------------------------------------------
 */

const wrongStates = [true, 1, 'str', null, undefined, new Date(), new Map(), Object.create(null), new (class User { })()]
const wrongUpdateObjects = [undefined, null, 'name', [], ['name'], new Map([['name', 'new']])]

describe.each([
   ['update', update],
   ['experimental_extendableUpdate', experimental_extendableUpdate],
])('%s wrong types', (_, updateFn) => {

   it.each(wrongStates)('should throw with %o as state', (state) => {
      expect(() => updateFn(state, {})).toThrow()
   })

   it.each(wrongUpdateObjects)('should throw with %o as update object', (updates) => {
      expect(() => updateFn(objectExample, updates)).toThrow()
   })

})

/**
 * --------------------------------------------
 *  RESULTING VALUES
 * --------------------------------------------
 */

const valueCases = [
   { title: 'empty update object', state: { a: 1 }, updates: {}, expected: { a: 1 } },
   { title: 'top-level prop', state: { a: 1 }, updates: { a: 2 }, expected: { a: 2 } },
   { title: 'nested prop', state: { a: { b: 1 } }, updates: { 'a.b': 2 }, expected: { a: { b: 2 } } },
   { title: 'array index', state: { list: [1, 2] }, updates: { 'list.1': 3 }, expected: { list: [1, 3] } },
   { title: 'prop inside array item', state: { list: [{ id: 1 }] }, updates: { 'list.0.id': 2 }, expected: { list: [{ id: 2 }] } },
   { title: 'array as state', state: [1, { a: 1 }], updates: { '0': 0, '1.a': 2 }, expected: [0, { a: 2 }] },
   { title: 'function update', state: { count: 1 }, updates: { count: (v) => v + 1 }, expected: { count: 2 } },
   { title: 'function update on missing prop', state: {}, updates: { count: (v) => v ?? 0 }, expected: { count: 0 } },
   { title: 'function value with set', state: { onClick: null }, updates: { onClick: set(callback) }, expected: { onClick: callback } },
   { title: 'new top-level prop', state: {}, updates: { a: 1 }, expected: { a: 1 } },
   { title: 'missing object in the path', state: {}, updates: { 'a.b': 1 }, expected: { a: { b: 1 } } },
   { title: 'undefined object in the path', state: { a: undefined }, updates: { 'a.b': 1 }, expected: { a: { b: 1 } } },
   { title: 'null object in the path', state: { a: null }, updates: { 'a.b': 1 }, expected: { a: { b: 1 } } },
   { title: 'primitive in the path', state: { a: 'str' }, updates: { 'a.b': 1 }, expected: { a: { b: 1 } } },
   { title: 'missing array in the path', state: {}, updates: { 'a.0.b': 1 }, expected: { a: [{ b: 1 }] } },
   { title: "'01' is not an index", state: {}, updates: { 'a.01': 1 }, expected: { a: { '01': 1 } } },
   { title: 'index key on an existing object', state: { a: {} }, updates: { 'a.0': 1 }, expected: { a: { 0: 1 } } },
   { title: 'empty path is skipped', state: { a: 1 }, updates: { '': 2 }, expected: { a: 1 } },
   { title: 'falsy value', state: { a: 1 }, updates: { a: 0 }, expected: { a: 0 } },
   { title: 'null value', state: { a: 1 }, updates: { a: null }, expected: { a: null } },
   { title: 'updates in order', state: { a: { x: 1 } }, updates: { 'a.x': 2, a: (v) => ({ ...v, seen: v.x }) }, expected: { a: { x: 2, seen: 2 } } },
   { title: 'object replaced, then updated', state: { a: { x: 1 } }, updates: { a: { y: 1 }, 'a.x': 2 }, expected: { a: { y: 1, x: 2 } } },
   { title: 'update replaced later', state: { a: { x: 1 } }, updates: { 'a.x': 2, a: { y: 1 } }, expected: { a: { y: 1 } } },
   { title: 'key with dots', state: { 'a.b': 1 }, updates: { 'a.b': 2 }, expected: { 'a.b': 2 } },
   { title: 'nested key with dots', state: { a: { 'b.c': 1 } }, updates: { 'a.b.c': 2 }, expected: { a: { 'b.c': 2 } } },
   { title: 'no path inside a key with dots', state: { a: { 'b.c': { d: 1 } } }, updates: { 'a.b.c.d': 2 }, expected: { a: { 'b.c': { d: 1 }, b: { c: { d: 2 } } } } },
]

describe('update values', () => {

   it.each(valueCases)('$title', ({ state, updates, expected }) => {
      expect(update(state, updates)).toEqual(expected)
   })

   it.each(valueCases)('$title (experimental_extendableUpdate gives the same)', ({ state, updates, expected }) => {
      expect(experimental_extendableUpdate(state, updates)).toEqual(expected)
   })

})

/**
 * --------------------------------------------
 *  STRUCTURAL SHARING
 * --------------------------------------------
 */

const sharingCases = [
   { path: 'name', copied: [''], shared: ['data', 'data.nestedData', 'data.arrayExample', 'tuple'] },
   { path: 'data.nestedData.deep', copied: ['', 'data', 'data.nestedData'], shared: ['data.arrayExample', 'tuple'] },
   { path: 'data.arrayExample.0.name', copied: ['', 'data', 'data.arrayExample', 'data.arrayExample.0'], shared: ['data.nestedData', 'data.arrayExample.1', 'tuple'] },
   { path: 'tuple.1', copied: ['', 'tuple'], shared: ['data'] },
   { path: 'newProp.nested', copied: [''], shared: ['data', 'tuple'] },
]

describe('update structural sharing', () => {

   describe.each(sharingCases)('updating "$path"', ({ path, copied, shared }) => {
      const newValue = update(objectExample, { [path]: 'new' })

      it.each(copied)('should copy "%s"', (copiedPath) => {
         expect(select(newValue, copiedPath)).not.toBe(select(objectExample, copiedPath))
      })

      it.each(shared)('should keep the reference of "%s"', (sharedPath) => {
         expect(select(newValue, sharedPath)).toBe(select(objectExample, sharedPath))
      })

      it('should set the new value', () => {
         expect(select(newValue, path)).toBe('new')
      })
   })

})

/**
 * --------------------------------------------
 *  OPTIONS
 * --------------------------------------------
 */

const optionCases = [
   { title: 'new prop, add', options: { onNewProps: 'add' }, state: {}, updates: { a: 1 }, expected: { a: 1 } },
   { title: 'new prop, skip', options: { onNewProps: 'skip' }, state: { b: 1 }, updates: { a: 1, b: 2 }, expected: { b: 2 } },
   { title: 'new prop, error', options: { onNewProps: 'error' }, state: {}, updates: { a: 1 }, throws: true },
   { title: 'new nested prop, error', options: { onNewProps: 'error' }, state: {}, updates: { 'a.b': 1 }, throws: true },
   { title: 'new index, add', options: { onNewIndexes: 'add' }, state: [1], updates: { '1': 2 }, expected: [1, 2] },
   { title: 'new index, skip', options: { onNewIndexes: 'skip' }, state: [1], updates: { '1': 2, '0': 0 }, expected: [0] },
   { title: 'new index, error', options: { onNewIndexes: 'error' }, state: [1], updates: { '1': 2 }, throws: true },
   { title: 'new nested index, error', options: { onNewIndexes: 'error' }, state: { list: [] }, updates: { 'list.0.id': 1 }, throws: true },
   { title: 'string key in array uses onNewProps', options: { onNewProps: 'error' }, state: { list: [] }, updates: { 'list.first': 1 }, throws: true },
   { title: 'index key in object uses onNewProps', options: { onNewIndexes: 'error' }, state: { map: {} }, updates: { 'map.0': 1 }, expected: { map: { 0: 1 } } },
   { title: 'primitive in the path, error', options: { onPathsIntersectedByPrimitiveValues: 'error' }, state: { a: 'str' }, updates: { 'a.b': 1 }, throws: true },
   { title: 'null in the path, error', options: { onPathsIntersectedByPrimitiveValues: 'error' }, state: { a: null }, updates: { 'a.b': 1 }, throws: true },
   { title: 'undefined in the path, error', options: { onPathsIntersectedByPrimitiveValues: 'error' }, state: { a: undefined }, updates: { 'a.b': 1 }, expected: { a: { b: 1 } } },
]

describe('update options', () => {

   it.each(optionCases)('$title', ({ options, state, updates, expected, throws }) => {
      if (throws) return expect(() => update(state, updates, options)).toThrow()
      expect(update(state, updates, options)).toEqual(expected)
   })

   it.each(optionCases.filter(({ throws }) => throws))('$title (ignored by experimental_extendableUpdate)', ({ options, state, updates }) => {
      expect(() => experimental_extendableUpdate(state, updates, options)).not.toThrow()
   })

})
