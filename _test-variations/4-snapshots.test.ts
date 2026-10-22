// @ts-nocheck
/*
 * Variation 4: inline snapshots
 * The expected output lives next to each test and is written by vitest on the first run
 * (`vitest -u` rewrites it). Includes a sharing map ('same' / 'copied') to snapshot structural sharing.
 */
import { it, describe, expect } from 'vitest'
import { update } from '../src/immutable/immutableImplementation'
import { isObjectLiteral } from '../src/strictness/isObjectLiteral'

const objectExample = {
   name: 'test object',
   data: {
      nestedData: { deep: 'this is deep field' },
      arrayExample: [{ name: 'example 1' }, { name: 'example 2' }]
   },
   tuple: ['one', 'two']
}

/* mirrors the result: 'same' for kept references, 'copied' for new ones, nested for copied containers */
const sharingMap = (original, result) => {
   const isContainer = (value) => isObjectLiteral(value) || Array.isArray(value)
   if (!isContainer(result)) return result
   if (result === original) return 'same'
   const entries = Object.keys(result).map((key) => {
      const child = result[key]
      if (!isContainer(child)) return [key, child]
      const originalChild = isContainer(original) ? original[key] : undefined
      return [key, child === originalChild ? 'same' : sharingMap(originalChild, child)]
   })
   return { copied: Array.isArray(result) ? entries.map(([, value]) => value) : Object.fromEntries(entries) }
}

describe('update results', () => {

   it('should update a nested prop', () => {
      expect(update(objectExample, { 'data.nestedData.deep': 'new' })).toMatchInlineSnapshot(`
        {
          "data": {
            "arrayExample": [
              {
                "name": "example 1",
              },
              {
                "name": "example 2",
              },
            ],
            "nestedData": {
              "deep": "new",
            },
          },
          "name": "test object",
          "tuple": [
            "one",
            "two",
          ],
        }
      `)
   })

   it('should update props inside arrays and tuples', () => {
      expect(update(objectExample, { 'data.arrayExample.1.name': 'new', 'tuple.0': 'new' })).toMatchInlineSnapshot(`
        {
          "data": {
            "arrayExample": [
              {
                "name": "example 1",
              },
              {
                "name": "new",
              },
            ],
            "nestedData": {
              "deep": "this is deep field",
            },
          },
          "name": "test object",
          "tuple": [
            "new",
            "two",
          ],
        }
      `)
   })

   it('should apply function updates', () => {
      expect(update(objectExample, {
         name: (v) => v.toUpperCase(),
         'data.arrayExample': (v) => [...v, { name: 'example 3' }],
      })).toMatchInlineSnapshot(`
        {
          "data": {
            "arrayExample": [
              {
                "name": "example 1",
              },
              {
                "name": "example 2",
              },
              {
                "name": "example 3",
              },
            ],
            "nestedData": {
              "deep": "this is deep field",
            },
          },
          "name": "TEST OBJECT",
          "tuple": [
            "one",
            "two",
          ],
        }
      `)
   })

   it('should create missing objects and arrays', () => {
      expect(update({}, { 'address.city': 'Madrid', 'orders.0.id': 1, 'files.1.name': 'new' })).toMatchInlineSnapshot(`
        {
          "address": {
            "city": "Madrid",
          },
          "files": [
            ,
            {
              "name": "new",
            },
          ],
          "orders": [
            {
              "id": 1,
            },
          ],
        }
      `)
   })

   it('should replace null and primitives in the path', () => {
      expect(update({ manager: null, nickname: 'ana' }, { 'manager.name': 'Eva', 'nickname.short': 'a' })).toMatchInlineSnapshot(`
        {
          "manager": {
            "name": "Eva",
          },
          "nickname": {
            "short": "a",
          },
        }
      `)
   })

   it('should update keys containing dots only if they exist', () => {
      expect(update({ a: { 'b.c': 1 }, 'd.e': { f: 1 } }, { 'a.b.c': 2, 'd.e.f': 2 })).toMatchInlineSnapshot(`
        {
          "a": {
            "b.c": 2,
          },
          "d": {
            "e": {
              "f": 2,
            },
          },
          "d.e": {
            "f": 1,
          },
        }
      `)
   })

   it('should apply updates in order', () => {
      expect(update({ data: { x: 1 } }, { 'data.x': 2, data: (v) => ({ ...v, seen: v.x }), 'data.y': 3 })).toMatchInlineSnapshot(`
        {
          "data": {
            "seen": 2,
            "x": 2,
            "y": 3,
          },
        }
      `)
   })

   it("should skip new props and indexes with 'skip'", () => {
      expect(update({ list: [1], a: 1 }, { 'list.5': 6, b: 2, a: 2 }, { onNewProps: 'skip', onNewIndexes: 'skip' })).toMatchInlineSnapshot(`
        {
          "a": 2,
          "list": [
            1,
          ],
        }
      `)
   })

})

describe('update structural sharing', () => {

   it('should copy only the path to a nested prop', () => {
      expect(sharingMap(objectExample, update(objectExample, { 'data.nestedData.deep': 'new' }))).toMatchInlineSnapshot(`
        {
          "copied": {
            "data": {
              "copied": {
                "arrayExample": "same",
                "nestedData": {
                  "copied": {
                    "deep": "new",
                  },
                },
              },
            },
            "name": "test object",
            "tuple": "same",
          },
        }
      `)
   })

   it('should copy only the array item that changes', () => {
      expect(sharingMap(objectExample, update(objectExample, { 'data.arrayExample.0.name': 'new' }))).toMatchInlineSnapshot(`
        {
          "copied": {
            "data": {
              "copied": {
                "arrayExample": {
                  "copied": [
                    {
                      "copied": {
                        "name": "new",
                      },
                    },
                    "same",
                  ],
                },
                "nestedData": "same",
              },
            },
            "name": "test object",
            "tuple": "same",
          },
        }
      `)
   })

   it('should copy only the root with a top-level update', () => {
      expect(sharingMap(objectExample, update(objectExample, { name: 'new' }))).toMatchInlineSnapshot(`
        {
          "copied": {
            "data": "same",
            "name": "new",
            "tuple": "same",
          },
        }
      `)
   })

})

describe('update errors', () => {

   it('should throw on wrong state', () => {
      expect(() => update(new Date(0), {})).toThrowErrorMatchingInlineSnapshot(`[Error: ""1970-01-01T00:00:00.000Z"" is not an literalObject/array]`)
   })

   it('should throw on wrong update object', () => {
      expect(() => update({}, [])).toThrowErrorMatchingInlineSnapshot(`[Error: wrong "updateObject" type provided]`)
   })

   it("should throw on new props with onNewProps: 'error'", () => {
      expect(() => update({ a: 1 }, { b: 1 }, { onNewProps: 'error' })).toThrowErrorMatchingInlineSnapshot(`[Error: Property/Index "b" doesnt exist in the path "b". Its value is: "{"a":1}"]`)
      expect(() => update({ a: {} }, { 'a.b.c': 1 }, { onNewProps: 'error' })).toThrowErrorMatchingInlineSnapshot(`[Error: b doesn't exist in "a.b.c"]`)
   })

   it("should throw on new indexes with onNewIndexes: 'error'", () => {
      expect(() => update({ list: [1] }, { 'list.3': 1 }, { onNewIndexes: 'error' })).toThrowErrorMatchingInlineSnapshot(`[Error: Property/Index "3" doesnt exist in the path "list.3". Its value is: "[1]"]`)
   })

   it("should throw on primitives with onPathsIntersectedByPrimitiveValues: 'error'", () => {
      expect(() => update({ name: 'str' }, { 'name.first': 1 }, { onPathsIntersectedByPrimitiveValues: 'error' })).toThrowErrorMatchingInlineSnapshot(`[Error: Property "name" in "name.first" is a primitive]`)
   })

})
