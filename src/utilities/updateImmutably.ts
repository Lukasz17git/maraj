import { DotPathUpdateObject } from "../types";

type DeepPartial<T> = {
   [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export const updateImmutably = <T extends object>(state: T, updates: DotPathUpdateObject<T>, nonStrict: boolean = false): T => {

   /* check for JS */
   if (state?.constructor !== Object && !Array.isArray(state)) throw `${state} is not an object/array so cant be updated immutably`

   if (!updates) return state

   const stateCopy = Array.isArray(state) ? [...state] as T : { ...state }
   const alreadyShallowCopiedPaths: DeepPartial<T> = {}

   for (const [pathSeparatedByDots, newValueToUpdate] of Object.entries(updates)) {
      if (!pathSeparatedByDots || pathSeparatedByDots === 'false' || pathSeparatedByDots === 'undefined' || pathSeparatedByDots === 'null') continue
      let pathKeysToReachLastKey = pathSeparatedByDots.split(".")
      let lastKeyWhereUpdateHappens = pathKeysToReachLastKey.pop()!
      let shallowCopiedPathsTracker = alreadyShallowCopiedPaths
      let currentParent = stateCopy
      // shallow copy recursively the path until i reach the object/array containing the "lastKeyWhereUpdateHappens"
      for (let currentKey of pathKeysToReachLastKey) {
         // @ts-ignore: checking if the currentParent[currentKey] is an object or array, skips null
         if (!currentParent[currentKey] || typeof currentParent[currentKey] !== 'object' || (currentParent[currentKey].constructor !== Object && !Array.isArray(currentParent[currentKey]))) throw `Invalid path provided: "${currentKey}" is not an object/array in "${pathSeparatedByDots}"`
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
      if (!nonStrict) {
         // parent may be either array or object, all the rest types cant reach this place
         // @ts-ignore: stringIndex < length => false if bigger or if its a string nonNumber, meaning that index to add doesnt exist, so throw error on strict mode
         if (Array.isArray(parentOfLastKey) && !(lastKeyWhereUpdateHappens < parentOfLastKey.length)) {
            throw `Use spread to add indexes in ${pathKeysToReachLastKey.join('.')}, because index ${lastKeyWhereUpdateHappens} doesnt exist in ${lastKeyWhereUpdateHappens}`
         }
         // if property doesnt exist, throw error on strict mode
         if (!parentOfLastKey.hasOwnProperty(lastKeyWhereUpdateHappens)) {
            throw `Property ${lastKeyWhereUpdateHappens} doesnt exist in the path ${pathKeysToReachLastKey.join('.')} because its current value is: ${parentOfLastKey}`
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