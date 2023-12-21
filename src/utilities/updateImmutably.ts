import { UpdateDotPathObject } from "../types";

const _updateImmutably: UpdateImmutably & UpdateImmutablyNonStrictly = (state, updates, mode: Modes = 'strict-paths') => {

   /* check for JS */
   if (state?.constructor !== Object && !Array.isArray(state)) throw new Error(`${state} is not an object/array so cant be updated immutably`)

   if (!updates) return state

   const stateCopy = Array.isArray(state) ? [...state] as typeof state : { ...state }
   const alreadyShallowCopiedPaths: DeepPartial<typeof state> = {}

   for (const [pathSeparatedByDots, newValueToUpdate] of Object.entries(updates)) {
      if (!pathSeparatedByDots || pathSeparatedByDots === 'false' || pathSeparatedByDots === 'undefined' || pathSeparatedByDots === 'null') continue
      let pathKeysToReachLastKey = pathSeparatedByDots.split(".")
      let lastKeyWhereUpdateHappens = pathKeysToReachLastKey.pop()!
      let shallowCopiedPathsTracker = alreadyShallowCopiedPaths
      let currentParent = stateCopy
      // shallow copy recursively the path until i reach the object/array containing the "lastKeyWhereUpdateHappens"
      for (let currentKey of pathKeysToReachLastKey) {
         // @ts-ignore: checking if the currentParent[currentKey] is an object or array, skips null
         if (!currentParent[currentKey] || typeof currentParent[currentKey] !== 'object' || (currentParent[currentKey].constructor !== Object && !Array.isArray(currentParent[currentKey]))) throw new Error(`Invalid path provided: "${currentKey}" is not an object/array in "${pathSeparatedByDots}"`)
         // @ts-ignore: checking if it has been already shallowCopied
         if (!shallowCopiedPathsTracker[currentKey]) {
            // @ts-ignore: updating the current parent AND ALSO THE STATECOPY to be a shallow copy of the parent
            currentParent[currentKey] = Array.isArray(currentParent[currentKey]) ? [...currentParent[currentKey]] : { ...currentParent[currentKey] }
            // @ts-ignore: adding the current shallow copied path temporally
            shallowCopiedPathsTracker[currentKey] = {}
         }
         // @ts-ignore: setting up the currentParent for the next currentKey
         currentParent = currentParent[currentKey]
         // @ts-ignore: setting up the tracker for the next currentKey
         shallowCopiedPathsTracker = shallowCopiedPathsTracker[currentKey]
      }
      // parent containing the currentKey where update happens, and its already shallow copied
      const parentOfLastKey = currentParent
      // prevent from adding new properties/indexes in strict mode
      if (mode !== 'implement-non-existent-paths') {
         const skipNonExistentPaths = mode === 'skip-non-existent-paths'
         // parent may be either array or object, all the rest types cant reach this place
         // @ts-ignore: stringIndex < length => false if bigger or if its a string nonNumber, meaning that index to add doesnt exist, so skip or throw error depending of the mode
         if (Array.isArray(parentOfLastKey) && !(lastKeyWhereUpdateHappens < parentOfLastKey.length)) {
            if (skipNonExistentPaths) continue
            throw new Error(`Use spread to add indexes in ${pathKeysToReachLastKey.join('.')}, because index ${lastKeyWhereUpdateHappens} doesnt exist in ${lastKeyWhereUpdateHappens}`)
         }
         // if property doesnt exist, skip or throw error depending of the mode
         if (!parentOfLastKey.hasOwnProperty(lastKeyWhereUpdateHappens)) {
            if (skipNonExistentPaths) continue
            throw new Error(`Property ${lastKeyWhereUpdateHappens} doesnt exist in the path ${pathKeysToReachLastKey.join('.')} because its current value is: ${parentOfLastKey}`)
         }
      }

      // @ts-ignore: setting the new value in the given path
      parentOfLastKey[lastKeyWhereUpdateHappens] = typeof newValueToUpdate === 'function' ? newValueToUpdate(parentOfLastKey[lastKeyWhereUpdateHappens]) : newValueToUpdate
      /* 
      need to delete where update happens in shallowCopiedPathsTracker because there may be a full object/array (lest call it "NewObjectValue") set as new value, 
      and after this there may be another new update but inside its properties,
      so i need after it shallow copy it again to prevent updating the original provided "NewObjectValue"
      @ts-ignore */
      delete shallowCopiedPathsTracker[lastKeyWhereUpdateHappens]
   }
   return stateCopy
}

type DeepPartial<T> = {
   [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

type StrictMode = 'strict-paths'
type SemiStrictMode = 'skip-non-existent-paths'
type NonStrictMode = 'implement-non-existent-paths'
type Modes = StrictMode | SemiStrictMode | NonStrictMode

type UpdateImmutably = {
   <T extends object>(state: T, updates: UpdateDotPathObject<T>): T
}

/**
 * Creates a new updated object/array applying the changes provided in the update object.
 * It doesnt modify the original input.
 * If any of the paths doesnt exists it returns
 */
export const updateImmutably: UpdateImmutably = _updateImmutably


type PosibleExpandedProps<T> = {
   [K in keyof T]?: T[K] extends object ? PosibleExpandedProps<T[K]> & Record<any, any> : T[K];
}

type UpdateImmutablyNonStrictly = {
   <T extends object>(state: T, updates: UpdateDotPathObject<T>, mode: SemiStrictMode): T
   <T extends object>(state: T, updates: UpdateDotPathObject<T>, mode: NonStrictMode): PosibleExpandedProps<T>
}

/**
 * Creates a new updated object/array applying the changes provided in the update object.
 * It doesnt modify the original input.
 * If any of the paths doesnt exists it adds it if possible.
 */
export const updateImmutablyAllowingNewProps: UpdateImmutablyNonStrictly = _updateImmutably