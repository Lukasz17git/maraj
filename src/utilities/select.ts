import { DotPaths, ValueInDotPath } from "../types"

/**
 * Creates a selector function using string path
 */
export const select = <TState extends object, TPath extends (DotPaths<TState> | '')>(
   state: TState,
   path: TPath
): ValueInDotPath<TState, TPath> | undefined => {
   //@ts-ignore: return state which is ValueInDotPath<TState,''>
   if (!path || typeof path !== 'string') return state
   //@ts-ignore: return ValueInDotPath<TState,TPath> | undefined
   return path.split(".").reduce((current, key) => {
      //@ts-ignore: the property must exist, if not then undefined
      if (current?.hasOwnProperty(key)) return current[key]
      return undefined
   }, state)
}