import { DotPaths, ReturnedValueInDotPath } from "../types"

type Select = {
   <T, TPath extends DotPaths<T>>(state: T, path: TPath): ReturnedValueInDotPath<T, TPath>
   <T, TPath extends ''>(state: T, path: TPath): T
}

/**
 * Returns the value from a given dot path of an object/array or undefined if doesn't exist.
 * @param state State from which retrieve the value.
 * @param path Path indicating the value to extract.
 * @returns Value of the provided path or undefined.
 */
export const select: Select = <T extends Record<PropertyKey, any>, P extends DotPaths<T> | ''>(state: T, path: P) => {
   
   /* throw error if path is not a string */
   if (typeof path !== 'string') throw new Error(`path is not a string`)
   
   /* state for path === '' */
   if (!path) return state

   /* retrieve the value or undefined */
   const splittedPath = path.split('.')
   let currentValue = state
   while (splittedPath.length) {
      const possibleDotPathKey = splittedPath.join('.')
      if (currentValue?.hasOwnProperty(possibleDotPathKey)) return currentValue[possibleDotPathKey]
      if (!currentValue?.hasOwnProperty(splittedPath[0]!)) return undefined
      currentValue = currentValue[splittedPath[0]!]
      splittedPath.shift()
   }
   return currentValue
}