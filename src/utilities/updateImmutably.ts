import { DotPathUpdateObject } from "../types";
import { isObjectLiteral } from "./isObjectLiteral";

type DeepPartial<T> = {
   [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

type UpdateImmutably = <T extends object>(state: T, updates: DotPathUpdateObject<T>, addNonExistentPropsAndIndexes?: true) => T

/**
 * Creates a new object applying immutable updates using dot-path syntax.
 * @param state Original State Object.
 * @param updates Dot Path Update Object.
 * @param addNonExistentPropsAndIndexes If it should or not create non-existent fields.
 * @returns New Updated Object.
 */

export const updateImmutably: UpdateImmutably = (state, updates, addNonExistentPropsAndIndexes?) => {

   /* check for JS */
   if (!isObjectLiteral(state) && !Array.isArray(state)) throw new Error(`${state} is not an object/array`)

   /* returns same state if no updates */
   if (!updates) return state

   const stateCopy = Array.isArray(state) ? [...state] as typeof state : { ...state }
   const alreadyShallowCopiedPaths: DeepPartial<typeof state> = {}

   for (const [pathSeparatedByDots, newValueToUpdate] of Object.entries(updates)) {
      if (!pathSeparatedByDots) continue
      let pathKeysToReachLastKey = pathSeparatedByDots.split(".")
      let lastKeyWhereUpdateHappens = pathKeysToReachLastKey.pop()!
      let shallowCopiedPathsTracker = alreadyShallowCopiedPaths
      let currentParent = stateCopy
      // shallow copy recursively the path until i reach the object/array containing the "lastKeyWhereUpdateHappens"
      for (let indexKey = 0; indexKey < pathKeysToReachLastKey.length; indexKey++) {
         const currentKey = pathKeysToReachLastKey[indexKey];

         // @ts-ignore: checking using js if its an object-literal or array
         const valueInCurrentKey = currentParent[currentKey]
         const isObjectOrArray = isObjectLiteral(valueInCurrentKey) || Array.isArray(valueInCurrentKey)
         const shouldCreateNonExistentNewProp = addNonExistentPropsAndIndexes && valueInCurrentKey === undefined

         if (!isObjectOrArray && !shouldCreateNonExistentNewProp) throw new Error(`Invalid path provided: "${currentKey}" is not an object/array in "${pathSeparatedByDots}"`)

         // @ts-ignore: checking if it has been already shallowCopied
         if (!shallowCopiedPathsTracker[currentKey]) {
            if (shouldCreateNonExistentNewProp) {
               // @ts-ignore: creating a new prop IN THE STATECOPY (declared above, because it's a reference), array if nextKey is an Index, object otherwise
               currentParent[currentKey] = isNaN(pathKeysToReachLastKey[indexKey + 1] ?? lastKeyWhereUpdateHappens) ? {} : []
            } else {
               // @ts-ignore: shallow copying the current parent IN THE STATECOPY (declared above, because it's a reference)
               currentParent[currentKey] = Array.isArray(valueInCurrentKey) ? [...valueInCurrentKey] : { ...valueInCurrentKey }
            }
            // @ts-ignore: adding the current shallow copied path temporally
            shallowCopiedPathsTracker[currentKey] = {}
         }
         // @ts-ignore: setting up the currentParent for the next iteration of currentKey
         currentParent = currentParent[currentKey]
         // @ts-ignore: setting up the tracker for the next iteration of currentKey
         shallowCopiedPathsTracker = shallowCopiedPathsTracker[currentKey]
      }
      // parent (object or array), already shallow copied, containing the lastKey where update happens, and its already shallow copied
      const parentOfLastKey = currentParent
      // prevent from adding new properties/indexes in strict mode
      if (!addNonExistentPropsAndIndexes) {
         // @ts-ignore: stringIndex < length => false if bigger or if its a string nonNumber, meaning that index to add doesnt exist, so skip or throw error depending of the mode
         if (Array.isArray(parentOfLastKey) && !(lastKeyWhereUpdateHappens < parentOfLastKey.length)) {
            throw new Error(`Index ${lastKeyWhereUpdateHappens} doesnt exist in the path ${pathKeysToReachLastKey.join('.')} because its value is ${lastKeyWhereUpdateHappens}, use spread operator for adding new indexes`)
         }
         // if property doesnt exist, skip or throw error depending of the mode
         if (!parentOfLastKey.hasOwnProperty(lastKeyWhereUpdateHappens)) {
            throw new Error(`Property ${lastKeyWhereUpdateHappens} doesnt exist in the path ${pathKeysToReachLastKey.join('.')} because its value is ${parentOfLastKey}`)
         }
      }

      // @ts-ignore: setting the new value in the given path
      parentOfLastKey[lastKeyWhereUpdateHappens] = typeof newValueToUpdate === 'function' ? newValueToUpdate(parentOfLastKey[lastKeyWhereUpdateHappens], stateCopy) : newValueToUpdate
      /* 
      need to delete where update happens in shallowCopiedPathsTracker because there may be a full object/array (lest call it "NewObjectValue")
      set as new value, and after this there may be another new update but inside its properties,
      so i need after it shallow copy it again to prevent updating the original provided "NewObjectValue"
      @ts-ignore */
      delete shallowCopiedPathsTracker[lastKeyWhereUpdateHappens]
   }
   return stateCopy
}