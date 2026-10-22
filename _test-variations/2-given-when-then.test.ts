// @ts-nocheck
/*
 * Variation 2: given / when / then
 * Nested describes tell a story; a fresh state per test (createState) and one result per "when",
 * so every "then" checks one thing and its title says which behavior broke.
 */
import { it, describe, expect, beforeEach, vi } from 'vitest'
import { update } from '../src/immutable/immutableImplementation'

const createState = () => ({
   user: { name: 'Ana', address: { city: 'Madrid' } },
   orders: [{ id: 1, items: ['book'] }, { id: 2, items: ['pen'] }],
   settings: { theme: 'dark' },
   nickname: 'ana',
   manager: null,
})

describe('given an object state', () => {
   let state
   let snapshot
   beforeEach(() => {
      state = createState()
      snapshot = structuredClone(state)
   })

   describe('when updating a nested prop', () => {
      let result
      beforeEach(() => { result = update(state, { 'user.address.city': 'Paris' }) })

      it('then the prop has the new value', () => expect(result.user.address.city).toBe('Paris'))
      it('then the original state is unchanged', () => expect(state).toEqual(snapshot))
      it('then a new root is returned', () => expect(result).not.toBe(state))
      it('then every object in the path is copied', () => {
         expect(result.user).not.toBe(state.user)
         expect(result.user.address).not.toBe(state.user.address)
      })
      it('then the objects outside the path keep their reference', () => {
         expect(result.orders).toBe(state.orders)
         expect(result.settings).toBe(state.settings)
      })
      it('then the sibling props keep their values', () => expect(result.user.name).toBe('Ana'))
   })

   describe('when updating an item inside an array', () => {
      let result
      beforeEach(() => { result = update(state, { 'orders.0.items.0': 'notebook' }) })

      it('then the item has the new value', () => expect(result.orders[0].items).toEqual(['notebook']))
      it('then the array is still an array', () => expect(result.orders).toSatisfy(Array.isArray))
      it('then the other items keep their reference', () => expect(result.orders[1]).toBe(state.orders[1]))
      it('then the original array is unchanged', () => expect(state.orders[0].items).toEqual(['book']))
   })

   describe('when several updates share the same path', () => {
      let result
      beforeEach(() => { result = update(state, { 'user.name': 'Eva', 'user.address.city': 'Rome' }) })

      it('then every update is applied', () => {
         expect(result.user).toEqual({ name: 'Eva', address: { city: 'Rome' } })
      })
   })

   describe('when an update is a function', () => {
      let updater
      let result
      beforeEach(() => {
         updater = vi.fn((items) => [...items, 'pencil'])
         result = update(state, { 'orders.1.items': updater })
      })

      it('then it is called once', () => expect(updater).toHaveBeenCalledTimes(1))
      it('then it gets only the current value', () => expect(updater.mock.calls[0]).toEqual([['pen']]))
      it('then its returned value is set', () => expect(result.orders[1].items).toEqual(['pen', 'pencil']))
   })

   describe('when a later update reads a value set by an earlier one', () => {
      let result
      beforeEach(() => { result = update(state, { 'settings.theme': 'light', settings: (v) => ({ ...v, previous: v.theme }) }) })

      it('then it gets the updated value', () => expect(result.settings).toEqual({ theme: 'light', previous: 'light' }))
   })

   describe('when an object is set and a later update goes inside it', () => {
      let newSettings
      let result
      beforeEach(() => {
         newSettings = { theme: 'blue' }
         result = update(state, { settings: newSettings, 'settings.theme': 'green' })
      })

      it('then the result has the last value', () => expect(result.settings).toEqual({ theme: 'green' }))
      it('then the given object is not mutated', () => expect(newSettings).toEqual({ theme: 'blue' }))
   })

   describe('when the path does not exist', () => {

      describe('and no options are given', () => {
         it('then the missing objects are created', () => {
            expect(update(state, { 'profile.bio': 'hi' }).profile).toEqual({ bio: 'hi' })
         })
         it('then a numeric key creates an array', () => {
            expect(update(state, { 'tags.0': 'new' }).tags).toEqual(['new'])
         })
         it('then null in the path is replaced by an object', () => {
            expect(update(state, { 'manager.name': 'Eva' }).manager).toEqual({ name: 'Eva' })
         })
         it('then a primitive in the path is replaced by an object', () => {
            expect(update(state, { 'nickname.short': 'a' }).nickname).toEqual({ short: 'a' })
         })
      })

      describe("and onNewProps is 'error'", () => {
         it('then it throws', () => {
            expect(() => update(state, { 'user.age': 30 }, { onNewProps: 'error' })).toThrow()
         })
      })

      describe("and onNewProps is 'skip'", () => {
         it('then only that update is skipped', () => {
            expect(update(state, { 'user.age': 30, 'user.name': 'Eva' }, { onNewProps: 'skip' }).user).toEqual({ name: 'Eva', address: { city: 'Madrid' } })
         })
      })

      describe("and onNewIndexes is 'error'", () => {
         it('then a new index throws', () => {
            expect(() => update(state, { 'orders.5': { id: 6 } }, { onNewIndexes: 'error' })).toThrow()
         })
         it('then an existing index does not throw', () => {
            expect(() => update(state, { 'orders.1.id': 3 }, { onNewIndexes: 'error' })).not.toThrow()
         })
      })

      describe("and onNewIndexes is 'skip'", () => {
         it('then only that update is skipped', () => {
            expect(update(state, { 'orders.5': { id: 6 }, 'orders.0.id': 0 }, { onNewIndexes: 'skip' }).orders.map(({ id }) => id)).toEqual([0, 2])
         })
      })

      describe("and onPathsIntersectedByPrimitiveValues is 'error'", () => {
         it('then a primitive in the path throws', () => {
            expect(() => update(state, { 'nickname.short': 'a' }, { onPathsIntersectedByPrimitiveValues: 'error' })).toThrow()
         })
         it('then null in the path throws', () => {
            expect(() => update(state, { 'manager.name': 'Eva' }, { onPathsIntersectedByPrimitiveValues: 'error' })).toThrow()
         })
      })
   })
})

describe('given an array state', () => {
   let state
   beforeEach(() => { state = [{ id: 1 }, { id: 2 }] })

   describe('when updating an index', () => {
      let result
      beforeEach(() => { result = update(state, { '1.id': 3 }) })

      it('then an array is returned', () => expect(result).toSatisfy(Array.isArray))
      it('then the item has the new value', () => expect(result[1]).toEqual({ id: 3 }))
      it('then the other items keep their reference', () => expect(result[0]).toBe(state[0]))
   })
})

describe('given a state with keys containing dots', () => {

   describe('when the full key exists', () => {
      it('then it is updated as one key', () => {
         expect(update({ a: { 'b.c': 1 } }, { 'a.b.c': 2 })).toEqual({ a: { 'b.c': 2 } })
      })
   })

   describe('when the path goes inside the value of that key', () => {
      it('then new nested objects are created instead', () => {
         expect(update({ 'a.b': { c: 1 } }, { 'a.b.c': 2 })).toEqual({ 'a.b': { c: 1 }, a: { b: { c: 2 } } })
      })
   })
})

describe('given a wrong argument', () => {

   describe('when the state is not an object literal or array', () => {
      it.each([null, 1, 'str', new Date(), new Map()])('then %o throws', (state) => {
         expect(() => update(state, {})).toThrow()
      })
   })

   describe('when the update object is not an object literal', () => {
      it.each([null, [], 'name'])('then %o throws', (updates) => {
         expect(() => update(createState(), updates)).toThrow()
      })
   })
})
