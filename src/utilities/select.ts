import { DotPaths, Index, IsPathIndexingAnArray, ValueInDotPath } from "../types"

type Select = <T, TPath extends (DotPaths<T> | '') >(
   state: T,
   path: TPath
) => TPath extends IsPathIndexingAnArray<Index> ? never
   : TPath extends IsPathIndexingAnArray<number> ? ValueInDotPath<T, TPath> | undefined : ValueInDotPath<T, TPath>

/**
 * Returns the value from a given dot path of an object/array.
 * Returns undefined if the provided path doesnt exist.
 */
export const select: Select = (state, path): typeof path extends IsPathIndexingAnArray<Index> ? never :
   typeof path extends IsPathIndexingAnArray<number> ? (ValueInDotPath<typeof state, typeof path> | undefined)
   : ValueInDotPath<typeof state, typeof path> => {
   //@ts-ignore: return state which is ValueInDotPath<TState,''>
   if (!path || typeof path !== 'string') return state
   //@ts-ignore: return ValueInDotPath<TState,TPath> | undefined
   return path.split(".").reduce((current, key) => {
      //@ts-ignore: the property must exist, if not then undefined
      if (current?.hasOwnProperty(key)) return current[key]
      return undefined
   }, state)
}
