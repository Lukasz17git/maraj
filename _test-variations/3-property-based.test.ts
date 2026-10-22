// @ts-nocheck
/*
 * Variation 3: property-based tests with a seeded random generator (no extra dependency)
 * Builds hundreds of random states and updates and checks rules that must always hold, plus a
 * naive deep-clone implementation as oracle. A failing case prints its seed to replay it.
 */
import { it, describe, expect } from 'vitest'
import { update } from '../src/immutable/immutableImplementation'
import { select } from '../src/immutable/select'
import { isObjectLiteral } from '../src/strictness/isObjectLiteral'
import { isStringIndex } from '../src/strictness/stringIndex'

const RUNS = 300
const KEYS = ['a', 'b', 'c', 'name', 'list', 'data']

/**
 * --------------------------------------------
 *  RANDOM GENERATORS
 * --------------------------------------------
 */

/* mulberry32: same seed -> same sequence, so a failure can be replayed */
const createRandom = (seed) => () => {
   seed = (seed + 0x6D2B79F5) | 0
   let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
   t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
   return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const pick = (random, list) => list[Math.floor(random() * list.length)]

const randomPrimitive = (random) => pick(random, [0, 1, 42, '', 'str', true, false, null, undefined])

const randomValue = (random, depth) => {
   const kind = depth <= 0 ? 'primitive' : pick(random, ['primitive', 'object', 'array'])
   if (kind === 'primitive') return randomPrimitive(random)
   if (kind === 'array') return Array.from({ length: Math.floor(random() * 3) }, () => randomValue(random, depth - 1))
   return randomObject(random, depth - 1)
}

const randomObject = (random, depth) => {
   const object = {}
   KEYS.filter(() => random() < 0.4).forEach((key) => { object[key] = randomValue(random, depth) })
   return object
}

/* every path in the state, with the objects/arrays first so a parent comes before its children */
const allPaths = (value, prefix = '') => Object.keys(value).flatMap((key) => {
   const path = prefix ? `${prefix}.${key}` : key
   const child = value[key]
   const isContainer = isObjectLiteral(child) || Array.isArray(child)
   return isContainer ? [path, ...allPaths(child, path)] : [path]
})

const leafPaths = (value) => allPaths(value).filter((path) => {
   const child = select(value, path)
   return !isObjectLiteral(child) && !Array.isArray(child)
})

/* a missing path: an existing one (or none) plus 1-2 random keys or indexes */
const randomNewPath = (random, state) => {
   const base = pick(random, ['', ...allPaths(state)])
   const extraKeys = Array.from({ length: 1 + Math.floor(random() * 2) }, () => pick(random, [...KEYS, '0', '1']))
   return [base, ...extraKeys].filter(Boolean).join('.')
}

/**
 * --------------------------------------------
 *  ORACLE
 * --------------------------------------------
 */

/* same rules as update without options, written the slow and obvious way */
const naiveUpdate = (state, updates) => {
   const copy = structuredClone(state)
   Object.entries(updates).forEach(([path, newValue]) => {
      if (path === '') return
      const keys = path.split('.')
      const lastKey = keys.pop()
      let parent = copy
      keys.forEach((key, i) => {
         const isContainer = isObjectLiteral(parent[key]) || Array.isArray(parent[key])
         if (!isContainer) parent[key] = isStringIndex(keys[i + 1] ?? lastKey) ? [] : {}
         parent = parent[key]
      })
      parent[lastKey] = typeof newValue === 'function' ? newValue(parent[lastKey]) : newValue
   })
   return copy
}

/**
 * --------------------------------------------
 *  PROPERTIES
 * --------------------------------------------
 */

const forEachRun = (check) => {
   for (let seed = 1; seed <= RUNS; seed++) {
      const random = createRandom(seed)
      const state = randomObject(random, 3)
      try {
         check(random, state)
      } catch (error) {
         error.message = `seed ${seed}, state ${JSON.stringify(state)}\n${error.message}`
         throw error
      }
   }
}

const randomLeafUpdates = (random, state) => {
   const updates = {}
   leafPaths(state).filter(() => random() < 0.5).forEach((path) => { updates[path] = pick(random, ['new', 7, null, false]) })
   return updates
}

describe('update properties', () => {

   it('should never mutate the original state', () => {
      forEachRun((random, state) => {
         const snapshot = structuredClone(state)
         update(state, { ...randomLeafUpdates(random, state), [randomNewPath(random, state)]: 'new' })
         expect(state).toEqual(snapshot)
      })
   })

   it('should set every value in its path', () => {
      forEachRun((random, state) => {
         const updates = randomLeafUpdates(random, state)
         const result = update(state, updates)
         Object.entries(updates).forEach(([path, value]) => expect(select(result, path)).toBe(value))
      })
   })

   it('should copy every object in the updated paths and keep the reference of the rest', () => {
      forEachRun((random, state) => {
         const updates = randomLeafUpdates(random, state)
         const result = update(state, updates)
         const updatedPaths = Object.keys(updates)
         const isInUpdatedPath = (path) => updatedPaths.some((updatedPath) => updatedPath.startsWith(`${path}.`))

         expect(result).not.toBe(state)
         allPaths(state).forEach((path) => {
            const before = select(state, path)
            if (!isObjectLiteral(before) && !Array.isArray(before)) return
            if (isInUpdatedPath(path)) expect(select(result, path)).not.toBe(before)
            else expect(select(result, path)).toBe(before)
         })
      })
   })

   it('should give the same result as the naive implementation, also with new paths', () => {
      forEachRun((random, state) => {
         const updates = randomLeafUpdates(random, state)
         updates[randomNewPath(random, state)] = 'new'
         updates[randomNewPath(random, state)] = (v) => [v]
         expect(update(state, updates)).toEqual(naiveUpdate(state, updates))
      })
   })

   it('should give the same result applying the updates at once or one by one', () => {
      forEachRun((random, state) => {
         const updates = { ...randomLeafUpdates(random, state), [randomNewPath(random, state)]: 'new' }
         const oneByOne = Object.entries(updates).reduce((current, [path, value]) => update(current, { [path]: value }), state)
         expect(update(state, updates)).toEqual(oneByOne)
      })
   })

   it('should give an equal copy with an empty update object', () => {
      forEachRun((random, state) => {
         const result = update(state, {})
         expect(result).toEqual(state)
         expect(result).not.toBe(state)
         Object.keys(state).forEach((key) => expect(result[key]).toBe(state[key]))
      })
   })

   it("should throw with onNewProps: 'error' only if a prop is missing", () => {
      forEachRun((random, state) => {
         const existingUpdates = randomLeafUpdates(random, state)
         const missingPath = randomNewPath(random, state)
         const hasMissingProp = select(state, missingPath) === undefined && !leafPaths(state).includes(missingPath)
         expect(() => update(state, existingUpdates, { onNewProps: 'error', onNewIndexes: 'error' })).not.toThrow()
         if (hasMissingProp) expect(() => update(state, { [missingPath]: 1 }, { onNewProps: 'error', onNewIndexes: 'error' })).toThrow()
      })
   })

})
