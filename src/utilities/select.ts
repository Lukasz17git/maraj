import { DotPaths, ReturnedValueInDotPath } from "../types"

type Select = <TObject, TPath extends DotPaths<TObject> | '' >(
   state: TObject,
   path: TPath
) => ReturnedValueInDotPath<TObject, TPath>

/**
 * Returns the value from a given dot path of an object/array.
 * Returns undefined if the provided path doesnt exist.
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
