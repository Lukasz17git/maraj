import { UpdateObject, ExtendedUpdate, DotPaths } from "../types/types";
import { isObjectLiteral } from "./isObjectLiteral";
import { isStringIndex } from "./stringIndex";

/** Index literal type to improve DX at managing updates. */
const LITERAL_INDEX = "${number}"
export type LiteralIndex = typeof LITERAL_INDEX

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

   /* tracker of already shallow copied paths */
   const alreadyShallowCopiedPaths: Tracker = {}

   for (const [pathSeparatedByDots, newValueToUpdate] of Object.entries(updates)) {

      /* continue if path === '', cant be !path because 0 is a valid option */
      if (pathSeparatedByDots === '') continue

      /* setting up the keys, tracker and the current parent (all mutable)*/
      let pathKeys = pathSeparatedByDots.split(".")
      let shallowCopiedPathsTracker = alreadyShallowCopiedPaths

      /* It has to be an object literal or array because of the previous lines */
      let currentParent = stateCopy as Record<string, any>

      /* shallow copy recursively the path until i reach the object/array containing the last key */
      while (pathKeys.length > 1) {

         /* checking if a full dot-path key exist in the object, supporting only full matching keys */
         const posibleFullDotPathKey = pathKeys.join('.')
         if (Object.hasOwn(currentParent, posibleFullDotPathKey)) {
            pathKeys = [posibleFullDotPathKey]
            break
         }

         /* current key and its value to check */
         const currentKey = pathKeys[0]!
         const valueInCurrentKey = currentParent[currentKey]

         /* checking the type in "valueInCurrentKey" */
         const isCurrentValueAnObject = isObjectLiteral(valueInCurrentKey)
         const isCurrentValueAnArray = isArray(valueInCurrentKey)
         const isCurrentValueUndefined = valueInCurrentKey === undefined
         /* It has to be undefined instead of "hasOwnProperty" because i may want to add more nested props in this value
          and there could be a case where the prop exist and is set up as undefined.
          For example partial properties set to undefined which can contain an object/array. */
         //TODO: maybe i need to override also primitive properties?, because a prop can have object/primitive as different values?

         if (!isCurrentValueAnObject && !isCurrentValueAnArray && !isCurrentValueUndefined) {
            if (options.onPathsIntersectedByPrimitiveValues === 'error') throw new Error(`Property "${currentKey}" in "${pathSeparatedByDots}" is a primitive`)
            if (options.onPathsIntersectedByPrimitiveValues === 'skip') continue
         }

         /* checking if the current path has been already shallowCopied */
         if (!shallowCopiedPathsTracker[currentKey]) {
            if (!isCurrentValueAnObject && !isCurrentValueAnArray) {
               //TODO: Maybe add so you can't add new string properties to an array?
               const isCurrentKeyAnIndex = isArray(currentParent) && isStringIndex(currentKey)
               const isNextKeyAnIndex = isStringIndex(pathKeys[1]!)
               const optionBehaviour = isCurrentKeyAnIndex ? options.onNewIndexes : options.onNewProps
               if (optionBehaviour === 'error') throw new Error(`${currentKey} doesn't exist in "${pathSeparatedByDots}"`)
               if (optionBehaviour === 'skip') continue
               currentParent[currentKey] = isNextKeyAnIndex ? [] : {}
            } else {
               /* shallow copying the current parent IN THE STATECOPY (declared above, because it's a reference) */
               currentParent[currentKey] = isCurrentValueAnArray ? [...valueInCurrentKey] : { ...valueInCurrentKey }
            }
            /* adding the current shallow copied path to the tracker */
            shallowCopiedPathsTracker[currentKey] = {}
         }

         /* setting up the currentParent for the next iteration of currentKey */
         currentParent = currentParent[currentKey]
         /* setting up the tracker for the next iteration of currentKey */
         shallowCopiedPathsTracker = shallowCopiedPathsTracker[currentKey]!
         /* removing current key from pathKeys for the next iteration */
         pathKeys.shift()
      }

      /* lastKeyWhereUpdateHappens must always exist */
      const lastKeyWhereUpdateHappens = pathKeys[0]!
      /* parent (has to always be an object or array), already shallow copied, containing the lastKey where update happens. */
      const parentOfLastKey = currentParent

      /* behaviour on new properties/indexes */
      if (!Object.hasOwn(parentOfLastKey, lastKeyWhereUpdateHappens)) {
         const isCurrentKeyAnIndex = isArray(parentOfLastKey) && isStringIndex(lastKeyWhereUpdateHappens)
         const optionBehaviour = isCurrentKeyAnIndex ? options.onNewIndexes : options.onNewProps
         if (optionBehaviour === 'error') throw new Error(`Property/Index "${lastKeyWhereUpdateHappens}" doesnt exist in the path "${pathSeparatedByDots}". Its value is: "${toJson(parentOfLastKey)}"`)
         if (optionBehaviour === 'skip') continue
      }

      /* setting the new value in the given path, if prop doesnt exist it will add it */
      parentOfLastKey[lastKeyWhereUpdateHappens] = typeof newValueToUpdate === 'function' ? newValueToUpdate(parentOfLastKey[lastKeyWhereUpdateHappens]) : newValueToUpdate

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
