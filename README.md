# Maraj

A small utility for **immutable updates** of objects and arrays with dot paths. Fully typed, about 1.2 KB gzipped. Includes helpers to work with updates (`remove`, `select`, `set`, ...).

### Features

- `update` with typed dot paths (`'files.0.name'`), checked by TypeScript.
- Several updates in one call, sharing the copies of common parents.
- Function updates that get the current value.
- Only the objects and arrays along each path are copied; everything else keeps its reference.
- Options to add, skip or throw on missing props and indexes.
- Helpers: `remove`, `select`, `set`, `splitPathAtLastKey` and a few type helpers.

```sh
npm install maraj
```

```ts
import { update } from 'maraj'

const original = { name: 'one', lastname: 'two', modified: false, files: [{ filename: 'one' }, { filename: 'two' }] }

const updated = update(original, {
   'name': 'updated',
   'modified': (value) => !value,
   'files.0.filename': 'zero',
})
// updated = { name: 'updated', lastname: 'two', modified: true, files: [{ filename: 'zero' }, { filename: 'two' }] }
original.files[1] === updated.files[1] // true, not copied
original.files === updated.files // false, copied because 'files.0' changed
```

<u>**For TypeScript:**</u> set **"strictNullChecks"** and **"noUncheckedIndexedAccess"** to **true** in tsconfig.json, so optional props and props that can be `undefined` get the right type (`{ key?: string }` is not the same as `{ key: string | undefined }`). With **"exactOptionalPropertyTypes"** too, setting `undefined` on a prop that isn't optional is an error.

## update

```ts
update(state, updateObject, options?)
```

- `state`: an object literal or array, anything else throws (`Date`, `Map`, class instances, `null`).
- `updateObject`: an object literal of `{ 'dot.path': newValue }`, applied in order.
- `options`: what to do with paths that don't exist yet (see [Options](#options)).

Returns a new object with the updates; `state` is never changed.

- A **function** as value is called with the current value (`undefined` if the prop doesn't exist) and its result is set. To set a function as the value, use [`set`](#set).
- Missing parents are created: an array when the next key is an index (`'files.1.name'` on `{}` -> `{ files: [<empty>, { name }] }`), an object otherwise.
- A primitive or `null` in the middle of a path is replaced by a new object (`'a.b'` on `{ a: 1 }` -> `{ a: { b } }`).
- Only own props are read: `'toString.value'` creates a `toString` prop instead of reading `Object.prototype.toString`.
- A path with `'__proto__'` throws (it would change the prototype of the copy).
- An empty path (`''`) is skipped, and so are symbol keys.

```ts
import { update } from 'maraj'

const data = {
   profile: { name: 'Lukasz' },
   works: ['soum', 'fi'],
   history: [
      { title: 'soum', size: 90, available: true },
      { title: 'fi', size: 30, available: false },
   ],
}

const newData = update(data, {
   'profile.name': 'Lucas',
   'works.1': 'gs',
   'history.1.available': (available) => !available,
   'works': (works) => [...works, 'portfolio'], // runs after 'works.1', so it gets ['soum', 'gs']
})
```

TypeScript only accepts paths that exist in the type of `state`, with values of the same type. Use [`experimental_extendableUpdate`](#experimental_extendableupdate) to add new props.

### Options

Each option takes `'add'` (default), `'skip'` or `'error'`:

- `onNewProps`: a prop doesn't exist, in an object, or a string key in an array.
- `onNewIndexes`: an index doesn't exist in an array (`'works.5'` on a 2-item array). `'error'` makes sure no empty items are created.
- `onPathsIntersectedByPrimitiveValues`: a primitive or `null` is in the middle of the path (`'a.b'` on `{ a: 1 }`). `'add'` replaces it with an object.

`'skip'` skips only that path, at any depth, and still applies the rest. `'error'` throws an `Error` naming the key and the path.

```ts
update({ a: { d: 1 } }, { 'a.b.c': 1, 'a.d': 2 }, { onNewProps: 'skip' })
// { a: { d: 2 } }

update({ list: [1, 2] }, { 'list.5': 3 }, { onNewIndexes: 'error' })
// throws: Property/Index "5" doesnt exist in the path "list.5"...
```

## experimental_extendableUpdate

Same as `update`, but TypeScript also accepts new paths and the returned type includes them. It has no options: new props and indexes are always added.

```ts
import { experimental_extendableUpdate } from 'maraj'

const newData = experimental_extendableUpdate(data, {
   'profile.age': 28, // new prop
   'profile.name': 'Lucas',
   'works.10': 'gs', // new index, items 2 to 9 are left empty
})
```

A number in the path creates a mutable array when nothing exists there yet. To get an object instead, set it first:

```ts
experimental_extendableUpdate({}, { 'files.1.name': 'new name' })
// { files: [<empty>, { name: 'new name' }] }

experimental_extendableUpdate({}, {
   'files': {},
   'files.1.name': 'new name',
})
// { files: { '1': { name: 'new name' } } }
```

## set

Returns a function update that always returns the given value. Use it to:

- Set a function as a value (a plain function would be called as an update).
- Get a stricter type when TypeScript mixes up an optional prop with one that can be `undefined` (usually props of items inside arrays): `set(undefined)` is an error.

```ts
import { update, set } from 'maraj'

const button = { label: 'Save', onClick: () => {}, files: [{ name: 'one' }] }

update(button, {
   'onClick': set(() => console.log('clicked')),
   'files.0.name': set('new name'),
})
```

## remove

Returns a copy of an object without the given keys, or of an array without the given indexes. Use it inside a function update.

- Objects: only optional keys can be removed (TypeScript).
- Arrays: indexes as numbers or strings (`1`, `'1'`), in any order; repeated or out-of-range indexes are ignored.
- Anything other than an object literal or array throws.

```ts
import { update, remove } from 'maraj'

type Person = { profile: { name: string, nickname?: string }, works: string[] }
const person: Person = { profile: { name: 'Lukasz', nickname: 'Luk' }, works: ['soum', 'fi', 'gs'] }

update(person, {
   'profile': (profile) => remove(profile, 'nickname'), // removes "nickname"
   'works': (works) => remove(works, [1, '0']), // ['gs']
})
```

## select

Returns the value in a dot path, or `undefined` if the path doesn't exist. `''` returns the whole state.

- Only own props are read: `'profile.toString'` and `'tags.map'` give `undefined`, and so does `'size'` on a `Map`.
- `null` or `undefined` in the middle of the path gives `undefined`.
- A key with dots (`{ 'a.b': 1 }`) is found when it matches the whole rest of the path.

```ts
import { select } from 'maraj'

const work1SizeSelector = (state) => select(state, 'history.1.size') // state.history[1].size
```

## splitPathAtLastKey

Splits a dot path into the path before the last key and the last key (for example, to get an id).

```ts
import { splitPathAtLastKey } from 'maraj'

const [remainingPath, lastKey] = splitPathAtLastKey('projects.1.data.size')
// remainingPath = 'projects.1.data', lastKey = 'size'

splitPathAtLastKey('size') // ['', 'size']
```

## Type helpers

- `strictType<T, U>(value)`: returns `value` as `U`, and TypeScript errors when `value` has props `U` doesn't have (plain assignment allows them).
- `strict(value)` (or `s`): returns `value` unchanged, typed as `Strict<T>`.
- `isObjectLiteral(value)`: `true` when the prototype is `Object.prototype` (`{}`, `{ a: 1 }`); `false` for arrays, `null`, `Object.create(null)`, `Date`, `Map`, class instances and objects from another realm (`node:vm`, iframes).
- `isStringIndex(key)`: `true` when `key` is an integer written as `parseInt` would write it (`'1'`); `false` for `'01'`, `'1.5'`, `''` and `'NaN'`. `parseStringIndex(key)` returns that number, or `null`.
- `forEachEntry(object, (key, value) => ...)`: `Object.keys(object).forEach` with typed keys and values.

```ts
import { strictType } from 'maraj'

type User = { name: string, age?: number }
const saveUser = (user: User) => { /* ... */ }

const user = { name: 'Ana', admin: true }
saveUser(user) // no error
saveUser(strictType<typeof user, User>(user)) // error: "admin" isn't in User
```

## Limitations

- **Keys with dots** (`{ 'this.is.dotted.key': 123 }`) work only when they already exist and the path ends on them. The path `'a.b.c.d'` works on:
  - `{ 'a.b.c.d': ... }`
  - `{ a: { 'b.c.d': ... } }`
  - `{ a: { b: { 'c.d': ... } } }`
  - `{ a: { b: { c: { d: ... } } } }`

  Paths into the value of a dotted key don't: with `{ a: { 'b.c': { d: 1 } } }`, `'a.b.c'` works but `'a.b.c.d'` creates `a.b.c.d` next to `'b.c'`: `{ a: { 'b.c': { d: 1 }, b: { c: { d: ... } } } }`.

- **`UpdateObject` with a computed key** in an object literal is a TypeScript error even when the types are right. Assign the key after creating the object:

```ts
import type { DotPaths, UpdateObject, UpdateValue } from 'maraj'

const updateField = <T, TPath extends DotPaths<T>>(state: T, path: TPath, newValue: UpdateValue<T, TPath>) => {
   // ts error, even if the typing is correct (TypeScript issue)
   const updateObject1: UpdateObject<T> = { [path]: newValue }

   // no ts error
   const updateObject2: UpdateObject<T> = {}
   updateObject2[path] = newValue
   return update(state, updateObject2)
}
```

## Benchmarks

<!-- bench:start -->
Median speed against maraj in 11 scenarios (higher is faster)

```text
dot-prop-immutable     ██████████████████████████████  1.26x
maraj                  ████████████████████████        1.00x
timm                   ██████████████████              0.77x
object-path-immutable  ██████████████                  0.58x
immer (no autofreeze)  ████████████                    0.49x
immutability-helper    ██████████                      0.41x
lodash/fp              █████████                       0.38x
mutative               ████████                        0.35x
immer                  ███████                         0.30x
```
<!-- bench:end -->

`1.50x` means 1.5 times as many updates per second as maraj. The scenarios go from one top-level prop to 100 paths in a 1,000-item array: see [benchmarks/README.md](benchmarks/README.md) for each one, the machine and how to run them.

## Development

| Script          | Does                                                 |
| --------------- | ---------------------------------------------------- |
| `npm run dev`   | Runs the tests in watch mode                         |
| `npm test`      | Runs the tests once                                  |
| `npm run lint`  | Type-checks with `tsc`                               |
| `npm run trace` | Writes a `tsc` trace to `trace/`, to find slow types |
| `npm run build` | Builds ESM + CJS and types to `dist`                 |
| `npx changeset` | Adds a changeset for the next release                |

The benchmarks have their own `package.json`: `cd benchmarks && npm install && npm run bench`.

### Releasing

1. Run `npx changeset`, pick the bump type and describe the change, and commit the generated file.
2. When pushed to `main`, CI opens a "Version Packages" PR and runs the checks on it.
3. Merging that PR publishes to npm with [trusted publishing](https://docs.npmjs.com/trusted-publishers) (no npm token needed).
