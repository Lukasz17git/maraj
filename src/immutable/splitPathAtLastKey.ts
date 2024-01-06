
type PathWithoutLastKey = string
type LastKey = string
type SplitDotPathAtLastKey = <T extends string>(dotPath: T) => [PathWithoutLastKey, LastKey]

/**
 * Splits a dot path string into its last key and its remaining keys ('' if none).
 * @param dotPath A dot path.
 * @returns [pathWithoutLastKey, lastKey] or ['', lastKey].
 */
export const splitPathAtLastKey: SplitDotPathAtLastKey = (dotPath) => {
   if (typeof dotPath !== 'string') throw new Error(`Wrong dotPath type: ${dotPath}`)
   const lastDot = dotPath.lastIndexOf(".") + 1
   const pathWithoutLastKey = lastDot ? dotPath.slice(0, lastDot - 1) : ''
   const lastKey = dotPath.slice(lastDot)
   return [pathWithoutLastKey, lastKey]
}