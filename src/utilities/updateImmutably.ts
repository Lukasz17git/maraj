import { DotPathUpdateObject } from "../types";

type DeepPartial<T> = {
   [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export const updateImmutably = <T extends object | any[]>(state: T, updates: DotPathUpdateObject<T> = {}, strict: boolean = true) => {

   /* check for JS */
   if (state?.constructor !== Object && !Array.isArray(state)) return state

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
         // @ts-ignore: checking if the currentParent[currentKey] is an object or array 
         if (typeof currentParent[currentKey] !== 'object' || !currentParent[currentKey]) throw new Error(`Invalid path provided: "${currentKey}" is not an object/array in "${pathSeparatedByDots}"`)
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
      if (strict) {
         // parent may be either array or object, all the rest types cant reach this place
         // @ts-ignore: stringIndex < length => false if bigger or if its a string nonNumber
         if (Array.isArray(parentOfLastKey) && !(lastKeyWhereUpdateHappens < parentOfLastKey.length)) {
            throw new Error(`Use spread to add indexes in ${pathKeysToReachLastKey.join('.')}, because index ${lastKeyWhereUpdateHappens} doesnt exist in ${lastKeyWhereUpdateHappens}`)
         }
         if (!parentOfLastKey.hasOwnProperty(lastKeyWhereUpdateHappens)) {
            throw new Error(`Property ${lastKeyWhereUpdateHappens} doesnt exist in ${lastKeyWhereUpdateHappens}`)
         }
      }
      // @ts-ignore: setting the new value in the givven path
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