import { DotPaths, ValueInDotPath } from "../types"

/**
 * Creates a selector function using string path
 */
export const select = <TState extends object | any[], TPath extends DotPaths<TState>>(
   state: TState,
   path: TPath
): ValueInDotPath<TState, TPath> | undefined => {
   if (!path || typeof path !== 'string') return state as ValueInDotPath<TState, TPath>
   return path.split(".").reduce((current, key) => {
      //@ts-ignore: the property must exist, if not then undefined
      if (current?.hasOwnProperty(key)) return current[key]
      return undefined
   }, state) as ValueInDotPath<TState, TPath> | undefined
}