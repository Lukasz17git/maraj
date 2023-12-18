
# Maraj

A lightweight alternative for creating **immutable updates of objects and arrays** such as Immer or ImmutableJS.

**4 times faster** and **over 10 times lighter**.

Fully typed.

Only **400 bytes** gziped and additional **300 bytes** for 4 common utilities that you will most likelly need in every project.

Features:

- Can accept multiple updates while mantaining the order of execution.
- Easy syntax for conditional updates.
- Functional updates.

Vitest: <https://www.npmjs.com/package/maraj-test>

## Creating an Immutable Update

The **updateImmutably** function has two arguments:

1. The **Original object**.
2. An **Update object** (key-value pairs representing the updates we want to make)

The **Update Object** has the following syntax:

```js
{
    'my.path.separated.by.dots': 'The new value',
    'another.path': 'new value',
    'myArray.0.name': 'new name in object inside array at index 0',
    [false && 'path.conditionalUpdate']: true
}
```

Multiple key-value pairs that mantains the order of execution.

- **Keys:** path name of the fiels, separated by dots.
  - For arrays just use its index value
  - Can accept conditional statements. (If the key = false or undefined or null it will skip that field update.)

- **Value:** new value, any type. If its a function it ll be called with the current value in that field.

## Example

```js
import updateImmutably, { spread } from "maraj";

const data = {
    person: { name: "Lukasz", works: ["soum", "fi"] },
    works: [
        { title: "soum", size: 90, available: true, info: ["info1"] },
        { title: "fi", size: 30, available: false, info: ["infoA"] },
    ]
}

const newUpdatedObject = updateImmutably(data, {
    "age": 28, //add new values
    "person.name": "Lucas", //update values
    "person.works.1": "gs", //nested array update
    "works.1.available": (currentValue) => (!currentValue), //functional update
    [false && "works.0.size"]: 120, //conditional field update
    "person.works": (v) => spread(v, "portfolio") //common utilities
})

/** Does not make a deep copy and "falsy" fields are ignored */
newUpdatedObject.works[0] === data.works[0] //true

/** New Updated Object 
{
    person: { name: "Lucas", works: ["soum", "gs", "portfolio"], age: 28 },
    works: [
        { title: "soum", size: 90, available: true, info: ["info1"] },
        { title: "fi", size: 30, available: true, info: ["infoA"] },
    ]
}
*/
```

## Other Utilities

### spread

**For Objects and Arrays: Spreads** its argument into the key provided in the updateImmutably.
**For the rest: Sets** its argument into the key provided in the updateImmutably.

```js
import {spread} from 'maraj'

const newUpdatedObject = updateImmutably(data,{
    'person': (value) => spread(value, {info1: 'new Info'}), //same as (newValue) => (value) => ({...value, ...newValue})
    'works': (value) => spread(value, {title: 'new project', size: 20}) //same as (newValueToAdd) => (value) => ([...value, ...newValueToAdd])
    'person.works': (value) => spread(value, "portfolio") //same as (newValue) => (value) => (newValue)
})
```

### remove

Removes the **key of an object** or the **index of an array** in the key provided in the **updateImmutably.**

```js
import {remove} from 'maraj'

const newUpdatedObject = updateImmutably(person,{
    'person': (value) => remove(value, 'works'), // returns new value (in this case "person") without the provided key ("works")
    'works': (value) => remove(value, 1) // returns new array (in this case "works") without the provided index (1)
})
```

### select

**Creates a store selector** from provided string path.

Usefull in cases like getting data from Redux, Zustand, and so on. stores.

```js
import {select} from 'maraj'

const stringPath = 'works.1.size'

const storeSelector = (state) => select(state, stringPath) // will behave as (store) => store[works][1][size]
```

### splitPathAtLastKey

Usefull when you want to spread multiple values into objects dynamically

Splits string path (example:'projects.1.data.size' ) into two:

- id: the last key in the path (in this case 'size')
- remainingPath: the remaining path (in this case 'projects.1.data')

```js
import {splitPathAtLastKey} from 'maraj'

const stringPath = 'works.1.size'

const [remainingPath, last] = splitPathAtLastKey(stringPath)
// last = 'size'
// remainingPath = 'works.1'
```
