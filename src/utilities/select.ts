import { DotPaths, ReturnedValueInDotPath } from "../types"

type Select = <TObject, TPath extends DotPaths<TObject> | '' >(
   state: TObject,
   path: TPath
) => ReturnedValueInDotPath<TObject, TPath>

/**
 * Returns the value from a given dot path of an object/array or undefined if doesn't exist.
 * @param state State from which retrieve the value.
 * @param path Path indicating the value to extract.
 * @returns Value of the provided path or undefined.
 */

export const select: Select = (state, path): ReturnedValueInDotPath<typeof state, typeof path> => {
   //@ts-ignore: return state which is ValueInDotPath<TState,''>
   if (!path || typeof path !== 'string') return state
   //@ts-ignore: return ValueInDotPath<TState,TPath> | undefined
   return path.split(".").reduce((current, key) => {
      //@ts-ignore: the property must exist, if not then undefined
      if (current?.hasOwnProperty(key)) return current[key]
      return undefined
   }, state)
}
