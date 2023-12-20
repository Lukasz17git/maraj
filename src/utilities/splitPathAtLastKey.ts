
type SplitDotPathAtLastKey = <T extends string>(dotPath: T) => [string, string]

/**
 * Splits string dotPath into ID and RemainingPath
*/
export const splitPathAtLastKey: SplitDotPathAtLastKey = (dotPath) => {
   if (typeof dotPath !== 'string') throw new Error(`Wrong dotPath type: ${dotPath}`)
   const lastDot = dotPath.lastIndexOf(".") + 1
   const pathWithoutLastKey = lastDot ? dotPath.slice(0, lastDot - 1) : ''
   const lastKey = dotPath.slice(lastDot)
   return [pathWithoutLastKey, lastKey]
}