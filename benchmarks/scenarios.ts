// @ts-nocheck
import { produce, Immer } from 'immer'
import { create } from 'mutative'
import immutabilityHelper from 'immutability-helper'
import * as objectPath from 'object-path-immutable'
import dotProp from 'dot-prop-immutable'
import fpSet from 'lodash/fp/set.js'
import fpUpdate from 'lodash/fp/update.js'
import * as timm from 'timm'
import { update } from '../src/immutable/immutableImplementation'
import { update as update3 } from './versions/3.0.0/immutableImplementation'
import { update as update2 } from './versions/2.11.0/immutableImplementation'

export const LIBRARIES = [
   'maraj',
   'maraj 3.0.0',
   'maraj 2.11.0',
   'spread by hand',
   'immer',
   'immer (no autofreeze)',
   'mutative',
   'immutability-helper',
   'object-path-immutable',
   'dot-prop-immutable',
   'lodash/fp',
   'timm',
] as const

export type Library = typeof LIBRARIES[number]
export type Scenario = {
   name: string
   description: string
   createState: () => any
   implementations: Partial<Record<Library, (state: any) => any>>
}

const immerWithoutFreeze = new Immer({ autoFreeze: false }).produce

/* every maraj version and both immer setups always run the same code */
const withMaraj = (updates, options?) => ({
   'maraj': (state) => update(state, updates, options),
   'maraj 3.0.0': (state) => update3(state, updates, options),
   'maraj 2.11.0': (state) => update2(state, updates, options),
})
const withImmer = (recipe) => ({
   'immer': (state) => produce(state, recipe),
   'immer (no autofreeze)': (state) => immerWithoutFreeze(state, recipe),
   'mutative': (state) => create(state, recipe),
})

/* hand-written recursive spread, for paths too deep to write inline */
const spreadSetIn = (value, [key, ...rest], newValue) => {
   const child = rest.length ? spreadSetIn(value[key], rest, newValue) : newValue
   if (Array.isArray(value)) {
      const copy = [...value]
      copy[key] = child
      return copy
   }
   return { ...value, [key]: child }
}

/* applies several [path, value] pairs with a one-path-per-call library */
const chain = (state, pairs, setFn) => pairs.reduce((current, [path, value]) => setFn(current, path, value), state)

const createUser = () => ({
   id: 1,
   name: 'Ana',
   active: false,
   profile: { address: { city: 'Madrid', zip: '28001' }, tags: ['admin', 'editor'] },
   settings: { theme: 'dark', language: 'es' },
})

const createList = () => ({
   title: 'list',
   items: Array.from({ length: 1000 }, (_, i) => ({ id: i, name: `item ${i}`, done: false })),
})

const DEEP_KEYS = Array.from({ length: 10 }, (_, i) => `level${i + 1}`)
const createDeep = () => {
   const leaf = { value: 0, other: 1 }
   const deep = DEEP_KEYS.reduceRight((child, key) => ({ [key]: child, sibling: { a: 1 } }), leaf)
   return { ...deep, meta: { createdAt: 0 } }
}

const WIDE_KEYS = Array.from({ length: 1000 }, (_, i) => `key${i}`)
const createWide = () => Object.fromEntries(WIDE_KEYS.map((key, i) => [key, { index: i }]))

const createStore = () => ({
   todos: Array.from({ length: 100 }, (_, i) => ({ id: i, title: `todo ${i}`, done: i % 2 === 0 })),
   users: { byId: Object.fromEntries(Array.from({ length: 50 }, (_, i) => [`u${i}`, { id: `u${i}`, name: `user ${i}` }])) },
   ui: { filter: 'all', loading: false },
})

const NEW_ITEM = { id: 1000, name: 'item 1000', done: false }
const EVERY_10TH = Array.from({ length: 100 }, (_, i) => i * 10)
const MANY_UPDATES = Object.fromEntries(EVERY_10TH.map((i) => [`items.${i}.done`, true]))
const MANY_HELPER_SPEC = { items: Object.fromEntries(EVERY_10TH.map((i) => [i, { done: { $set: true } }])) }
const MANY_PAIRS = EVERY_10TH.map((i) => [`items.${i}.done`, true])
const MANY_ARRAY_PAIRS = EVERY_10TH.map((i) => [['items', i, 'done'], true])

const FIVE_PAIRS = [
   ['name', 'Eva'],
   ['profile.address.city', 'Paris'],
   ['profile.address.zip', '75001'],
   ['profile.tags.0', 'owner'],
   ['settings.theme', 'light'],
]
const FIVE_ARRAY_PAIRS = FIVE_PAIRS.map(([path, value]) => [path.split('.').map((key) => /^\d+$/.test(key) ? Number(key) : key), value])

const DEEP_PATH = [...DEEP_KEYS, 'value'].join('.')
const DEEP_HELPER_SPEC = [...DEEP_KEYS].reduceRight((spec, key) => ({ [key]: spec }), { value: { $set: 1 } })

const toggle = (done) => !done

export const SCENARIOS: Scenario[] = [
   {
      name: 'Top-level prop',
      description: "Sets `active` on a small user object.",
      createState: createUser,
      implementations: {
         ...withMaraj({ active: true }),
         'spread by hand': (s) => ({ ...s, active: true }),
         ...withImmer((d) => { d.active = true }),
         'immutability-helper': (s) => immutabilityHelper(s, { active: { $set: true } }),
         'object-path-immutable': (s) => objectPath.set(s, 'active', true),
         'dot-prop-immutable': (s) => dotProp.set(s, 'active', true),
         'lodash/fp': (s) => fpSet('active', true, s),
         'timm': (s) => timm.set(s, 'active', true),
      },
   },
   {
      name: 'Nested prop (depth 3)',
      description: "Sets `profile.address.city`.",
      createState: createUser,
      implementations: {
         ...withMaraj({ 'profile.address.city': 'Paris' }),
         'spread by hand': (s) => ({ ...s, profile: { ...s.profile, address: { ...s.profile.address, city: 'Paris' } } }),
         ...withImmer((d) => { d.profile.address.city = 'Paris' }),
         'immutability-helper': (s) => immutabilityHelper(s, { profile: { address: { city: { $set: 'Paris' } } } }),
         'object-path-immutable': (s) => objectPath.set(s, 'profile.address.city', 'Paris'),
         'dot-prop-immutable': (s) => dotProp.set(s, 'profile.address.city', 'Paris'),
         'lodash/fp': (s) => fpSet('profile.address.city', 'Paris', s),
         'timm': (s) => timm.setIn(s, ['profile', 'address', 'city'], 'Paris'),
      },
   },
   {
      name: 'Deep prop (depth 11)',
      description: "Sets `level1.level2…level10.value`, every level has a sibling object.",
      createState: createDeep,
      implementations: {
         ...withMaraj({ [DEEP_PATH]: 1 }),
         'spread by hand': (s) => spreadSetIn(s, [...DEEP_KEYS, 'value'], 1),
         ...withImmer((d) => { DEEP_KEYS.reduce((node, key) => node[key], d).value = 1 }),
         'immutability-helper': (s) => immutabilityHelper(s, DEEP_HELPER_SPEC),
         'object-path-immutable': (s) => objectPath.set(s, DEEP_PATH, 1),
         'dot-prop-immutable': (s) => dotProp.set(s, DEEP_PATH, 1),
         'lodash/fp': (s) => fpSet(DEEP_PATH, 1, s),
         'timm': (s) => timm.setIn(s, [...DEEP_KEYS, 'value'], 1),
      },
   },
   {
      name: 'Item in a 1,000-item array',
      description: "Sets `items.500.done`.",
      createState: createList,
      implementations: {
         ...withMaraj({ 'items.500.done': true }),
         'spread by hand': (s) => {
            const items = [...s.items]
            items[500] = { ...items[500], done: true }
            return { ...s, items }
         },
         ...withImmer((d) => { d.items[500].done = true }),
         'immutability-helper': (s) => immutabilityHelper(s, { items: { 500: { done: { $set: true } } } }),
         'object-path-immutable': (s) => objectPath.set(s, 'items.500.done', true),
         'dot-prop-immutable': (s) => dotProp.set(s, 'items.500.done', true),
         'lodash/fp': (s) => fpSet('items.500.done', true, s),
         'timm': (s) => timm.setIn(s, ['items', 500, 'done'], true),
      },
   },
   {
      name: '5 updates at once',
      description: "Sets `name`, `profile.address.city`, `profile.address.zip`, `profile.tags.0` and `settings.theme`; one-path libraries chain 5 calls.",
      createState: createUser,
      implementations: {
         ...withMaraj(Object.fromEntries(FIVE_PAIRS)),
         'spread by hand': (s) => ({
            ...s,
            name: 'Eva',
            profile: { ...s.profile, address: { ...s.profile.address, city: 'Paris', zip: '75001' }, tags: ['owner', ...s.profile.tags.slice(1)] },
            settings: { ...s.settings, theme: 'light' },
         }),
         ...withImmer((d) => {
            d.name = 'Eva'
            d.profile.address.city = 'Paris'
            d.profile.address.zip = '75001'
            d.profile.tags[0] = 'owner'
            d.settings.theme = 'light'
         }),
         'immutability-helper': (s) => immutabilityHelper(s, {
            name: { $set: 'Eva' },
            profile: { address: { city: { $set: 'Paris' }, zip: { $set: '75001' } }, tags: { 0: { $set: 'owner' } } },
            settings: { theme: { $set: 'light' } },
         }),
         'object-path-immutable': (s) => chain(s, FIVE_PAIRS, objectPath.set),
         'dot-prop-immutable': (s) => chain(s, FIVE_PAIRS, dotProp.set),
         'lodash/fp': (s) => chain(s, FIVE_PAIRS, (current, path, value) => fpSet(path, value, current)),
         'timm': (s) => chain(s, FIVE_ARRAY_PAIRS, timm.setIn),
      },
   },
   {
      name: 'Function update',
      description: "Uppercases `profile.address.city` with a function of the current value.",
      createState: createUser,
      implementations: {
         ...withMaraj({ 'profile.address.city': (city) => city.toUpperCase() }),
         'spread by hand': (s) => ({ ...s, profile: { ...s.profile, address: { ...s.profile.address, city: s.profile.address.city.toUpperCase() } } }),
         ...withImmer((d) => { d.profile.address.city = d.profile.address.city.toUpperCase() }),
         'immutability-helper': (s) => immutabilityHelper(s, { profile: { address: { city: { $apply: (city) => city.toUpperCase() } } } }),
         'object-path-immutable': (s) => objectPath.update(s, 'profile.address.city', (city) => city.toUpperCase()),
         'dot-prop-immutable': (s) => dotProp.set(s, 'profile.address.city', (city) => city.toUpperCase()),
         'lodash/fp': (s) => fpUpdate('profile.address.city', (city) => city.toUpperCase(), s),
         'timm': (s) => timm.updateIn(s, ['profile', 'address', 'city'], (city) => city.toUpperCase()),
      },
   },
   {
      name: 'Append to a 1,000-item array',
      description: "Adds one item at the end of `items`.",
      createState: createList,
      implementations: {
         ...withMaraj({ items: (items) => [...items, NEW_ITEM] }),
         'spread by hand': (s) => ({ ...s, items: [...s.items, NEW_ITEM] }),
         ...withImmer((d) => { d.items.push(NEW_ITEM) }),
         'immutability-helper': (s) => immutabilityHelper(s, { items: { $push: [NEW_ITEM] } }),
         'object-path-immutable': (s) => objectPath.push(s, 'items', NEW_ITEM),
         'dot-prop-immutable': (s) => dotProp.set(s, 'items', (items) => [...items, NEW_ITEM]),
         'lodash/fp': (s) => fpUpdate('items', (items) => [...items, NEW_ITEM], s),
         'timm': (s) => timm.set(s, 'items', timm.addLast(s.items, NEW_ITEM)),
      },
   },
   {
      name: 'Wide object (1,000 keys)',
      description: "Sets `key500.index` in an object with 1,000 top-level keys.",
      createState: createWide,
      implementations: {
         ...withMaraj({ 'key500.index': -1 }),
         'spread by hand': (s) => ({ ...s, key500: { ...s.key500, index: -1 } }),
         ...withImmer((d) => { d.key500.index = -1 }),
         'immutability-helper': (s) => immutabilityHelper(s, { key500: { index: { $set: -1 } } }),
         'object-path-immutable': (s) => objectPath.set(s, 'key500.index', -1),
         'dot-prop-immutable': (s) => dotProp.set(s, 'key500.index', -1),
         'lodash/fp': (s) => fpSet('key500.index', -1, s),
         'timm': (s) => timm.setIn(s, ['key500', 'index'], -1),
      },
   },
   {
      name: '100 items in a 1,000-item array',
      description: "Sets `done` on every 10th item in one call; one-path libraries chain 100 calls.",
      createState: createList,
      implementations: {
         ...withMaraj(MANY_UPDATES),
         'spread by hand': (s) => {
            const items = [...s.items]
            EVERY_10TH.forEach((i) => { items[i] = { ...items[i], done: true } })
            return { ...s, items }
         },
         ...withImmer((d) => { EVERY_10TH.forEach((i) => { d.items[i].done = true }) }),
         'immutability-helper': (s) => immutabilityHelper(s, MANY_HELPER_SPEC),
         'object-path-immutable': (s) => chain(s, MANY_PAIRS, objectPath.set),
         'dot-prop-immutable': (s) => chain(s, MANY_PAIRS, dotProp.set),
         'lodash/fp': (s) => chain(s, MANY_PAIRS, (current, path, value) => fpSet(path, value, current)),
         'timm': (s) => chain(s, MANY_ARRAY_PAIRS, timm.setIn),
      },
   },
   {
      name: 'Create a missing path',
      description: "Sets `address.location.city` on a user without `address`.",
      createState: () => ({ id: 1, name: 'Ana' }),
      implementations: {
         ...withMaraj({ 'address.location.city': 'Madrid' }),
         'spread by hand': (s) => ({ ...s, address: { ...s.address, location: { ...s.address?.location, city: 'Madrid' } } }),
         ...withImmer((d) => {
            d.address ??= {}
            d.address.location ??= {}
            d.address.location.city = 'Madrid'
         }),
         'object-path-immutable': (s) => objectPath.set(s, 'address.location.city', 'Madrid'),
         'dot-prop-immutable': (s) => dotProp.set(s, 'address.location.city', 'Madrid'),
         'lodash/fp': (s) => fpSet('address.location.city', 'Madrid', s),
         'timm': (s) => timm.setIn(s, ['address', 'location', 'city'], 'Madrid'),
      },
   },
   {
      name: 'Reducer action',
      description: "Toggles `todos.42.done` (100 todos) and renames `users.byId.u7` (50 users), like a Redux reducer.",
      createState: createStore,
      implementations: {
         ...withMaraj({ 'todos.42.done': toggle, 'users.byId.u7.name': 'Eva' }),
         'spread by hand': (s) => {
            const todos = [...s.todos]
            todos[42] = { ...todos[42], done: !todos[42].done }
            return { ...s, todos, users: { ...s.users, byId: { ...s.users.byId, u7: { ...s.users.byId.u7, name: 'Eva' } } } }
         },
         ...withImmer((d) => {
            d.todos[42].done = !d.todos[42].done
            d.users.byId.u7.name = 'Eva'
         }),
         'immutability-helper': (s) => immutabilityHelper(s, { todos: { 42: { done: { $apply: toggle } } }, users: { byId: { u7: { name: { $set: 'Eva' } } } } }),
         'object-path-immutable': (s) => objectPath.set(objectPath.update(s, 'todos.42.done', toggle), 'users.byId.u7.name', 'Eva'),
         'dot-prop-immutable': (s) => dotProp.set(dotProp.set(s, 'todos.42.done', toggle), 'users.byId.u7.name', 'Eva'),
         'lodash/fp': (s) => fpSet('users.byId.u7.name', 'Eva', fpUpdate('todos.42.done', toggle, s)),
         'timm': (s) => timm.setIn(timm.updateIn(s, ['todos', 42, 'done'], toggle), ['users', 'byId', 'u7', 'name'], 'Eva'),
      },
   },
   {
      name: "Options set to 'error'",
      description: "Same as \"5 updates at once\" with `onNewProps` and `onNewIndexes` set to `'error'` (maraj only).",
      createState: createUser,
      implementations: {
         ...withMaraj(Object.fromEntries(FIVE_PAIRS), { onNewProps: 'error', onNewIndexes: 'error', onPathsIntersectedByPrimitiveValues: 'error' }),
      },
   },
]
