// @ts-nocheck
/*
 * Variation 5: custom matchers and real-world scenarios
 * expect.extend adds domain matchers (toBeImmutableUpdateOf, toHaveValuesInPaths) and the tests run
 * a todo-app reducer on a deep-frozen state, so they read like the app code that uses update.
 */
import { it, describe, expect } from 'vitest'
import { update } from '../src/immutable/immutableImplementation'
import { select } from '../src/immutable/select'
import { isObjectLiteral } from '../src/strictness/isObjectLiteral'

/**
 * --------------------------------------------
 *  HELPERS AND MATCHERS
 * --------------------------------------------
 */

const isContainer = (value) => isObjectLiteral(value) || Array.isArray(value)

/* any write to a frozen object throws in strict mode, so a mutation fails the test */
const deepFreeze = (value) => {
   Object.values(value).forEach((v) => isContainer(v) && deepFreeze(v))
   return Object.freeze(value)
}

const containerPaths = (value, prefix = '') => Object.keys(value).flatMap((key) => {
   const path = prefix ? `${prefix}.${key}` : key
   return isContainer(value[key]) ? [path, ...containerPaths(value[key], path)] : []
})

expect.extend({
   /* the root and every object above a changed path are copied; the rest keep their reference */
   toBeImmutableUpdateOf(received, original, changedPaths) {
      const problems = []
      if (received === original) problems.push('the root is the same reference')
      containerPaths(original).forEach((path) => {
         const isInsideChangedPath = changedPaths.some((changed) => path === changed || path.startsWith(`${changed}.`))
         if (isInsideChangedPath) return
         const isAboveChangedPath = changedPaths.some((changed) => changed.startsWith(`${path}.`))
         const isSameReference = select(received, path) === select(original, path)
         if (isAboveChangedPath && isSameReference) problems.push(`"${path}" should be copied`)
         if (!isAboveChangedPath && !isSameReference) problems.push(`"${path}" should keep its reference`)
      })
      return {
         pass: problems.length === 0,
         message: () => this.isNot ? `expected not to be an immutable update of changes in ${changedPaths}` : problems.join('\n'),
      }
   },
   toHaveValuesInPaths(received, valuesByPath) {
      const wrongPaths = Object.entries(valuesByPath).filter(([path, value]) => !this.equals(select(received, path), value))
      return {
         pass: wrongPaths.length === 0,
         message: () => wrongPaths
            .map(([path, value]) => `"${path}": expected ${this.utils.printExpected(value)}, received ${this.utils.printReceived(select(received, path))}`)
            .join('\n'),
      }
   },
})

/**
 * --------------------------------------------
 *  TODO APP
 * --------------------------------------------
 */

const initialState = deepFreeze({
   filter: 'all',
   todos: [
      { id: 1, title: 'Buy milk', done: false, tags: ['home'] },
      { id: 2, title: 'Write tests', done: true, tags: ['work'] },
   ],
   users: { ana: { name: 'Ana', assigned: [1] } },
})

const todoReducer = (state, action) => {
   switch (action.type) {
      case 'add': return update(state, { todos: (todos) => [...todos, action.todo] })
      case 'toggle': return update(state, { [`todos.${action.index}.done`]: (done) => !done })
      case 'rename': return update(state, { [`todos.${action.index}.title`]: action.title }, { onNewIndexes: 'error' })
      case 'tag': return update(state, { [`todos.${action.index}.tags`]: (tags) => [...tags, action.tag] })
      case 'assign': return update(state, { [`users.${action.user}.assigned`]: (assigned = []) => [...assigned, action.id] })
      case 'filter': return update(state, { filter: action.filter })
      default: return state
   }
}

/**
 * --------------------------------------------
 *  TESTS
 * --------------------------------------------
 */

describe('matchers', () => {

   it('should pass for a correct immutable update', () => {
      expect(update(initialState, { 'todos.0.done': true })).toBeImmutableUpdateOf(initialState, ['todos.0.done'])
   })

   it('should fail for a deep copy or the same reference', () => {
      expect(structuredClone(initialState)).not.toBeImmutableUpdateOf(initialState, ['todos.0.done'])
      expect(initialState).not.toBeImmutableUpdateOf(initialState, ['todos.0.done'])
   })

   it('should fail if a value is not in its path', () => {
      expect(initialState).not.toHaveValuesInPaths({ 'todos.0.done': true })
   })

})

describe('todo reducer', () => {

   it('should toggle a todo', () => {
      const state = todoReducer(initialState, { type: 'toggle', index: 0 })
      expect(state).toBeImmutableUpdateOf(initialState, ['todos.0.done'])
      expect(state).toHaveValuesInPaths({ 'todos.0.done': true, 'todos.1.done': true })
   })

   it('should add a todo keeping the reference of the others', () => {
      const todo = { id: 3, title: 'Deploy', done: false, tags: [] }
      const state = todoReducer(initialState, { type: 'add', todo })
      expect(state).toBeImmutableUpdateOf(initialState, ['todos'])
      expect(state).toHaveValuesInPaths({ 'todos.2': todo, 'todos.length': 3 })
      expect(state.todos[0]).toBe(initialState.todos[0])
   })

   it('should rename a todo', () => {
      const state = todoReducer(initialState, { type: 'rename', index: 1, title: 'Write more tests' })
      expect(state).toBeImmutableUpdateOf(initialState, ['todos.1.title'])
      expect(state).toHaveValuesInPaths({ 'todos.1.title': 'Write more tests', 'todos.1.id': 2 })
   })

   it('should throw renaming a todo that does not exist', () => {
      expect(() => todoReducer(initialState, { type: 'rename', index: 5, title: 'Ghost' })).toThrow()
   })

   it('should add a tag', () => {
      const state = todoReducer(initialState, { type: 'tag', index: 0, tag: 'urgent' })
      expect(state).toBeImmutableUpdateOf(initialState, ['todos.0.tags'])
      expect(state).toHaveValuesInPaths({ 'todos.0.tags': ['home', 'urgent'] })
   })

   it('should assign a todo to an existing user', () => {
      const state = todoReducer(initialState, { type: 'assign', user: 'ana', id: 2 })
      expect(state).toBeImmutableUpdateOf(initialState, ['users.ana.assigned'])
      expect(state).toHaveValuesInPaths({ 'users.ana.assigned': [1, 2], 'users.ana.name': 'Ana' })
   })

   it('should create a user that does not exist yet', () => {
      const state = todoReducer(initialState, { type: 'assign', user: 'eva', id: 2 })
      expect(state).toBeImmutableUpdateOf(initialState, ['users.eva'])
      expect(state).toHaveValuesInPaths({ 'users.eva': { assigned: [2] } })
   })

   it('should change the filter copying only the root', () => {
      const state = todoReducer(initialState, { type: 'filter', filter: 'done' })
      expect(state).toBeImmutableUpdateOf(initialState, ['filter'])
      expect(state).toHaveValuesInPaths({ filter: 'done' })
   })

   it('should return the same state on unknown actions', () => {
      expect(todoReducer(initialState, { type: 'unknown' })).toBe(initialState)
   })

   it('should run a whole session of actions without mutating any state', () => {
      const actions = [
         { type: 'add', todo: { id: 3, title: 'Deploy', done: false, tags: [] } },
         { type: 'toggle', index: 2 },
         { type: 'tag', index: 2, tag: 'release' },
         { type: 'assign', user: 'eva', id: 3 },
         { type: 'filter', filter: 'done' },
      ]
      const states = actions.reduce((all, action) => [...all, deepFreeze(todoReducer(all.at(-1), action))], [initialState])
      expect(states.at(-1)).toHaveValuesInPaths({
         filter: 'done',
         'todos.2': { id: 3, title: 'Deploy', done: true, tags: ['release'] },
         'users.eva.assigned': [3],
      })
      expect(states.at(-1).todos[0]).toBe(initialState.todos[0])
      expect(states.at(-1).users.ana).toBe(initialState.users.ana)
   })

})
