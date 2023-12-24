
# Maraj

A fast lightweight utility for creating **immutable updates**. Full typescript support. Only 600 bytes gziped. Includes usefull utilities for manipulating updates (like remove, select).

### Features

- Full typescript support.
- Correct type inference.
- Multiple updates at same time mantaining the order of execution.
- Functional updates.

**<u>For Typescript:</u>** in tsconfig.json set **"strictNullChecks"** and **"noUncheckedIndexedAccess"** to true for correct type inference of optional properties (so it can correctly differentiate between optional props and props with possible undefined value)

```ts
const originalValue = { name: 'one', lastname: 'two' modified: false, files: [{ filename: 'one' }] }

const updatedValue = updateImmutably(orignalValue, {
   'name': 'updated',
   'modified': (value, fullObject) => !value,
   'files.0.filename': 'zero',
})

// updatedValue = { name: 'updated', lastname: 'two' modified: true, files: [{ filename: 'zero' }] }

originalValue.files[1] === updatedValue.files[1] // true
```

### Limitations

- If "addNonExistentPropsAndIndexes" is enabled (3rd parameter in the updateImmutably function), **numbers** will **always** create an **array** if the array/object doesnt exist beforehand.

```ts
const updatedValue = updateImmutably({}, {
   'files.1.name': 'new name',
}, true)
// updatedValue = { files: [<empty>, { name: 'new name' }] }
// the "files" prop is an array.
```

- The type "UpdateDotPathObject" (the type used as second parameter in the updateImmutably function) if used to create new update objects using computed properties { [key]: value } will always throw a ts error even if the typing is correct. [Playground simple explanation](https://www.typescriptlang.org/play?ts=5.3.2#code/LAKALgngDgpgBAGQJYGcxwLxwOQENtwA+cABgCQDeAdgK4C2ARjAE4C+JooksiqYASjADGAe2YATTHApwA2gGk4SKrzQBdAPwAuOItacQoqmjhDmMXGBiDREqQB4AKnBgAPK1XEpVYAHwAKAGsYCB1HAEpMX2lQODijE3MhHWQ0GzFJLApYuNyAejy4AD0wbxZmMR0UZSF4ADcAFgA6AGYmgFYldAB3JAAbPrgwAAsK7rhcFXKxCfQhYeFA5QBzUxE6KBorSWCIb0nJOtw+mhhvGmqqVasNvst4PqQrZmOyupgVJAAzIYWh6BWSm8tiSYByuTkuzUOl24P0IFy5jANGYKiSoFYQA)

```ts
const updateFieldStore = <TPath extends DotPaths<Store>>(
   path: TPath,
   newValue: UpdateDotPathValue<Store, TPath>
) => {
   const update: UpdateDotPathObject<Store> = {
      // ^throws ts error even if the typing is correct
      [path]: newValue
   } // fix: coherce it with " as UpdateDotPathObject<Store>"
   return update
}
```

- Use the "set" utility if typescript doesn't distinguish properly _"an optional field"_ vs a _"field which can have 'undefined' as type"_. Usually happens in optional nested props inside arrays.

```ts
const updatedValue = updateImmutably(data, {
   'files.0.optionalProperty': 'new name',
   'files.1.optionalProperty': undefined, //no ts error
   'files.0.optionalProperty': set('new name'),
   'files.1.optionalProperty': set(undefined), //throws ts error, undefined cant be a value.
})
```

## Creating an Immutable Update

Arguments:

- Original Object
- Update Object
- If it should add non-existent properties/indexes

## Example

```js
import { updateImmutably } from "maraj";

const data = {
    profile: { name: "Lukasz" },
    works: ["soum", "fi"],
    history: [
        { title: "soum", size: 90, available: true, info: ["info1"] },
        { title: "fi", size: 30, available: false, info: ["infoA"] },
    ]
}

const newUpdatedObject = updateImmutably(data, {
    "profile.age": 28, //add new properties if "addNonExistentPropsAndIndexes" is enabled
    "profile.name": "Lucas", //update values
    "works.1": "gs", //nested array update
    "history.1.available": (currentValue) => (!currentValue), //functional update
    "works": (v) => [...v, 'portfolio'] //add new value to array
})
```

## Remove Utility

Removes the **key of an object** or the **index of an array** in the key provided in the **updateImmutably.**

```js
import {remove} from 'maraj'

const newUpdatedObject = updateImmutably(person,{
    'profile': (value) => remove(value, 'name'), // returns new value without the "name" prop
    'works': (value) => remove(value, 1), // returns new array without the provided index (1)
    'works': (value) => remove(value, [1, "0"]), // returns new array without the provided index (0,1)
})
```

## Select Utility

Selects the value of an object/array from a string-dot-path. Usefull in state management libraries.

```js
import {select} from 'maraj'

const stringPath = 'works.1.size'

const work1SizeSelector = (state) => select(state, stringPath) // will behave as (store) => store[works][1][size]
```

## SplitPathAtLastKey Utility

Usefull when you want to retrieve the last key (for example an id).

Splits string path (example:'projects.1.data.size' ) into two:

- remainingPath: the remaining path (in this case 'projects.1.data')
- lastKey: the last key in the path (in this case 'size')

```js
import { splitPathAtLastKey } from 'maraj'

const stringPath = 'works.1.size'

const [remainingPath, last] = splitPathAtLastKey(stringPath)
// last = 'size'
// remainingPath = 'works.1'
```

## Set Utility

In some unusual cases (usually when updating an optional object prop inside an array) typescript infers incorrectly the optional key vs a key with undefined value. To fix this typing issue, use the "set" function so it correctly infers the type in the field.

```ts
const updatedValue = updateImmutably(data, {
   'files.0.optionalProperty': 'new name',
   'files.1.optionalProperty': undefined, //no ts error
   'files.0.optionalProperty': set('new name'),
   'files.1.optionalProperty': set(undefined), //throws ts error, undefined cant be a value.
})
```
