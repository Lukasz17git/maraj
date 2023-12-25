import { DotPathUpdateObject } from "../types";
import { isObjectLiteral } from "./isObjectLiteral";
import { isStringIndex } from "./stringIndex";

/** Index literal type to improve DX at managing updates. */
const LITERAL_INDEX = "${number}"
export type LiteralIndex = typeof LITERAL_INDEX

type Tracker = { [K in string]?: Tracker }

type ArrayIndexedByStringsIntegers<T> = Record<`${number}` | string, T>

type ImmutableImplementation = <T extends object>(state: T, updates: DotPathUpdateObject<T>, addNonExistentPropsAndIndexes: boolean) => T

const immutableImplementation: ImmutableImplementation = (state, updates, addNonExistentPropsAndIndexes) => {

   /* check for JS */
   if (!isObjectLiteral(state) && !Array.isArray(state)) throw new Error(`"${state}" is not an literalObject/array`)

   /* returns same state if no updates */
   if (!updates) return state

   const stateCopy = Array.isArray(state) ? [...state] as typeof state : { ...state }
   const alreadyShallowCopiedPaths: Tracker = {}

   for (const [pathSeparatedByDots, newValueToUpdate] of Object.entries(updates)) {

      /* continue if path === '' */
      if (!pathSeparatedByDots) continue

      let pathKeysToReachLastKey = pathSeparatedByDots.split(".")
      /* throw if devs forgot to change LITERAL_INDEX into an actual number */
      if (pathKeysToReachLastKey.includes(LITERAL_INDEX)) throw new Error(`"${LITERAL_INDEX}" inside "${pathSeparatedByDots}"`)
      let lastKeyWhereUpdateHappens = pathKeysToReachLastKey.pop()!

      let shallowCopiedPathsTracker = alreadyShallowCopiedPaths
      let currentParent: Record<string, any> | ArrayIndexedByStringsIntegers<any> = stateCopy

      /* shallow copy recursively the path until i reach the object/array containing the "lastKeyWhereUpdateHappens" */
      for (let indexKey = 0; indexKey < pathKeysToReachLastKey.length; indexKey++) {
         const currentKey = pathKeysToReachLastKey[indexKey]! //must be a string

         const valueInCurrentKey = currentParent[currentKey]
         /* checking if currentParent[currentKey] is objectLiteral or array */
         const isObjectOrArray = isObjectLiteral(valueInCurrentKey) || Array.isArray(valueInCurrentKey)
         /* checking if currentParent[currentKey] undefined and if new prop should be added */
         const shouldCreateNonExistentNewProp = addNonExistentPropsAndIndexes && valueInCurrentKey === undefined

         if (!isObjectOrArray && !shouldCreateNonExistentNewProp) throw new Error(`"${currentKey}" doesnt exist in "${pathKeysToReachLastKey.slice(0, indexKey + 1).join('.')}"`)

         /* checking if the current path has been already shallowCopied */
         if (!shallowCopiedPathsTracker[currentKey]) {
            if (shouldCreateNonExistentNewProp) {
               /* creating a new prop IN THE STATECOPY (declared above, because currentParent[currentKey] keeps it's a reference),
                depending of the type of the nextKey, array if it is an Index, object otherwise */
               currentParent[currentKey] = isStringIndex(pathKeysToReachLastKey[indexKey + 1] ?? lastKeyWhereUpdateHappens) ? [] : {}
            } else {
               /* shallow copying the current parent IN THE STATECOPY (declared above, because it's a reference) */
               currentParent[currentKey] = Array.isArray(valueInCurrentKey) ? [...valueInCurrentKey] : { ...valueInCurrentKey }
            }
            /* adding the current shallow copied path to the tracker */
            shallowCopiedPathsTracker[currentKey] = {}
         }

         /* setting up the currentParent for the next iteration of currentKey */
         currentParent = currentParent[currentKey]

         /* setting up the tracker for the next iteration of currentKey */
         shallowCopiedPathsTracker = shallowCopiedPathsTracker[currentKey]!
      }

      /* parent (object or array), already shallow copied, containing the lastKey where update happens, and its already shallow copied */
      const parentOfLastKey = currentParent

      /* prevent from adding new properties/indexes in strict mode */
      if (!addNonExistentPropsAndIndexes && !parentOfLastKey.hasOwnProperty(lastKeyWhereUpdateHappens)) {
         throw new Error(`Property/Index "${lastKeyWhereUpdateHappens}" doesnt exist in the path "${pathKeysToReachLastKey.join('.') + '.' + lastKeyWhereUpdateHappens}". Its value is: "${parentOfLastKey}"`)
      }

      /* setting the new value in the given path */
      //@ts-ignore: if prop doesnt exist it will add it only if "addNonExistentPropsAndIndexes" is enabled
      parentOfLastKey[lastKeyWhereUpdateHappens] = typeof newValueToUpdate === 'function' ? newValueToUpdate(parentOfLastKey[lastKeyWhereUpdateHappens], stateCopy) : newValueToUpdate

      /* Need to delete where update happens in shallowCopiedPathsTracker because there may be a full object/array (lest
       call it "NewObjectValue") set as new value, and after this there may be another new update but inside its properties,
       so i need after it shallow copy it again to prevent updating the original provided "NewObjectValue" */
      delete shallowCopiedPathsTracker[lastKeyWhereUpdateHappens]
   }
   return stateCopy
}


type UpdateImmutably = <T extends object>(state: T, updates: DotPathUpdateObject<T>) => T

/**
 * Creates a new object applying strict immutable updates using dot-path syntax. Can't add new props or indexes.
 * @param state Original State Object.
 * @param updates Dot Path Update Object.
 * @param addNonExistentPropsAndIndexes If it should or not create non-existent fields.
 * @returns New Updated Object.
 */
export const updateImmutably: UpdateImmutably = (state, updates) => immutableImplementation(state, updates, false)


type ModifyImmutably = <T extends object>(state: T, updates: DotPathUpdateObject<T> | Record<string, any>) => T

/**
 * Creates a new object applying immutable modifications using dot-path syntax. It will add non-existent props or indexes if provided.
 * @param state Original State Object.
 * @param updates Dot Path Update Object.
 * @param addNonExistentPropsAndIndexes If it should or not create non-existent fields.
 * @returns New Updated Object.
 */
export const modifyImmutably: ModifyImmutably = (state, updates) => immutableImplementation(state, updates, true)