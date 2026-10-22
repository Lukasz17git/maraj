import { UpdateObject, ExtendedUpdate, DotPaths } from "./(immutable.types)";
import { isObjectLiteral } from "../strictness/isObjectLiteral";
import { isStringIndex } from "../strictness/stringIndex";

type Tracker = { [K in string]?: Tracker }

type OptionValues = 'error' | 'skip' | 'add'
type Options = { onNewProps?: OptionValues, onNewIndexes?: OptionValues, onPathsIntersectedByPrimitiveValues?: OptionValues }
type ImmutableImplementation = <T, U extends UpdateObject<T>>(state: T, updateObject: U, options?: Options) => T | ExtendedUpdate<T, U>

const toJson = (v: any) => JSON.stringify(v)
const isArray = (v: any) => Array.isArray(v)

const immutableImplementation: ImmutableImplementation = (state, updates, options = {}) => {

   /* checks state type */
   if (!isObjectLiteral(state) && !isArray(state)) throw new Error(`"${toJson(state)}" is not an literalObject/array`)

   /* checks updates type */
   if (!isObjectLiteral(updates)) throw new Error(`wrong "updateObject" type provided`)

   /* typeof state | ExtendedUpdate<typeof state, typeof updates> Assertion because it may add new props later in the execution */
   const stateCopy = (Array.isArray(state) ? [...state] : { ...state }) as typeof state | ExtendedUpdate<typeof state, typeof updates>

   /* tracker of already shallow copied paths, null prototype so 'toString' or '__proto__' don't look copied */
   const alreadyShallowCopiedPaths: Tracker = Object.create(null)

   const paths = Object.keys(updates)
   nextUpdate: for (let p = 0; p < paths.length; p++) {

      /* continue if path === '', cant be !path because 0 is a valid option */
      const pathSeparatedByDots = paths[p]!
      if (pathSeparatedByDots === '') continue
      const newValueToUpdate = (updates as Record<string, unknown>)[pathSeparatedByDots]

      const pathKeys = pathSeparatedByDots.split(".")

      /* '__proto__' would change the prototype of the copy instead of adding a prop */
      if (pathKeys.includes('__proto__')) throw new Error(`"__proto__" is not allowed in "${pathSeparatedByDots}"`)

      /* It has to be an object literal or array because of the previous lines */
      let currentParent = stateCopy as Record<string, any>
      let shallowCopiedPathsTracker = alreadyShallowCopiedPaths
      let lastKeyWhereUpdateHappens = pathKeys[pathKeys.length - 1]!
      /* index in pathSeparatedByDots where the keys not walked yet start ('a.b.c' -> 2 after 'a') */
      let remainingPathStart = 0

      /* shallow copy recursively the path until i reach the object/array containing the last key */
      for (let k = 0; k < pathKeys.length - 1; k++) {

         /* checking if a full dot-path key exist in the object, supporting only full matching keys */
         const posibleFullDotPathKey = k === 0 ? pathSeparatedByDots : pathSeparatedByDots.slice(remainingPathStart)
         if (Object.hasOwn(currentParent, posibleFullDotPathKey)) {
            lastKeyWhereUpdateHappens = posibleFullDotPathKey
            break
         }

         /* current key and its value to check, own props only ({}.constructor is undefined here) */
         const currentKey = pathKeys[k]!
         remainingPathStart += currentKey.length + 1
         const valueInCurrentKey = Object.hasOwn(currentParent, currentKey) ? currentParent[currentKey] : undefined

         /* already copied by a previous path (always an object/array), no type checks needed */
         const trackerOfCurrentKey = shallowCopiedPathsTracker[currentKey]
         if (trackerOfCurrentKey) {
            currentParent = valueInCurrentKey
            shallowCopiedPathsTracker = trackerOfCurrentKey
            continue
         }

         /* checking the type in "valueInCurrentKey" */
         const isCurrentValueAnArray = isArray(valueInCurrentKey)
         const isCurrentValueAnObject = !isCurrentValueAnArray && isObjectLiteral(valueInCurrentKey)

         let copy
         if (!isCurrentValueAnObject && !isCurrentValueAnArray) {
            /* It has to be undefined instead of "hasOwnProperty" because i may want to add more nested props in this value
             and there could be a case where the prop exist and is set up as undefined.
             For example partial properties set to undefined which can contain an object/array. */
            //TODO: maybe i need to override also primitive properties?, because a prop can have object/primitive as different values?
            if (valueInCurrentKey !== undefined) {
               if (options.onPathsIntersectedByPrimitiveValues === 'error') throw new Error(`Property "${currentKey}" in "${pathSeparatedByDots}" is a primitive`)
               if (options.onPathsIntersectedByPrimitiveValues === 'skip') continue nextUpdate
            }
            //TODO: Maybe add so you can't add new string properties to an array?
            const isCurrentKeyAnIndex = isArray(currentParent) && isStringIndex(currentKey)
            const isNextKeyAnIndex = isStringIndex(pathKeys[k + 1]!)
            const optionBehaviour = isCurrentKeyAnIndex ? options.onNewIndexes : options.onNewProps
            if (optionBehaviour === 'error') throw new Error(`${currentKey} doesn't exist in "${pathSeparatedByDots}"`)
            if (optionBehaviour === 'skip') continue nextUpdate
            copy = isNextKeyAnIndex ? [] : {}
         } else {
            /* shallow copying the current parent IN THE STATECOPY (declared above, because it's a reference) */
            copy = isCurrentValueAnArray ? [...valueInCurrentKey] : { ...valueInCurrentKey }
         }
         currentParent[currentKey] = copy

         /* adding the current shallow copied path to the tracker, and moving to it for the next key */
         currentParent = copy
         shallowCopiedPathsTracker = shallowCopiedPathsTracker[currentKey] = Object.create(null)
      }

      /* parent (has to always be an object or array), already shallow copied, containing the lastKey where update happens. */
      const parentOfLastKey = currentParent

      /* behaviour on new properties/indexes */
      const isNewKey = !Object.hasOwn(parentOfLastKey, lastKeyWhereUpdateHappens)
      if (isNewKey) {
         const isCurrentKeyAnIndex = isArray(parentOfLastKey) && isStringIndex(lastKeyWhereUpdateHappens)
         const optionBehaviour = isCurrentKeyAnIndex ? options.onNewIndexes : options.onNewProps
         if (optionBehaviour === 'error') throw new Error(`Property/Index "${lastKeyWhereUpdateHappens}" doesnt exist in the path "${pathSeparatedByDots}". Its value is: "${toJson(parentOfLastKey)}"`)
         if (optionBehaviour === 'skip') continue
      }

      /* setting the new value in the given path, if prop doesnt exist it will add it (functions get undefined) */
      const currentValue = isNewKey ? undefined : parentOfLastKey[lastKeyWhereUpdateHappens]
      parentOfLastKey[lastKeyWhereUpdateHappens] = typeof newValueToUpdate === 'function' ? newValueToUpdate(currentValue) : newValueToUpdate

      /* Need to delete where update happens in shallowCopiedPathsTracker because there may be a full object/array (lest
       call it "NewObjectValue") set as new value, and after this there may be another new update but inside its properties,
       so i need after it shallow copy it again to prevent updating the original provided "NewObjectValue" */
      delete shallowCopiedPathsTracker[lastKeyWhereUpdateHappens]
   }

   return stateCopy
}


type ImmutableUpdate = <TObject, TAllowedDotPathKeys extends DotPaths<TObject> = DotPaths<TObject>>(
   state: TObject,
   dotPathUpdateObject: UpdateObject<TObject, TAllowedDotPathKeys>,
   options?: Options
) => TObject

/**
 * Creates a new object applying immutable updates using dot-path syntax.
 * Can add or skip new props or indexes depending on options.
 * TYPESCRIPT: Dot-Path Update Object type must STRICTLY match the type of state.
 * @param state Original State Object.
 * @param dotPathUpdateObject Dot Path Update Object.
 * @param options Options to change JS behaviour on non-existent fields.
 * @returns New Updated Object.
 */
//@ts-ignore
export const update: ImmutableUpdate = (state, dotPathUpdateObject, options) => immutableImplementation(state, dotPathUpdateObject, options)


type ExtendableImmutableUpdate = <TObject, TUpdateObject extends UpdateObject<TObject> = UpdateObject<TObject>>(
   state: TObject,
   dotPathUpdateObject: TUpdateObject,
) => ExtendedUpdate<TObject, TUpdateObject>

/**
 * Creates a new object applying immutable updates using dot-path syntax.
 * It will always add non-existent props or indexes if provided.
 * TYPESCRIPT: Dot-Path Update Object type extends from the type of state and you can add new non-existent properties.
 * @param state Original State Object.
 * @param dotPathUpdateObject Dot Path Update Object.
 * @returns New Updated Object.
 */
//@ts-ignore
export const experimental_extendableUpdate: ExtendableImmutableUpdate = (state, dotPathUpdateObject) => immutableImplementation(state, dotPathUpdateObject)

/*
TODO: Maybe change it so it can accept any kind of value in a typed way?, and if its primitive the returned value
has to be the value provided, and maybe it can only accept { '': ...  } update object.
*/
