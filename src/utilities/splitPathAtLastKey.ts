/**
 * Splits string path into ID and RemainingPath
*/

export const splitPathAtLastKey = <T extends string>(path: T) => {
   if (typeof path !== 'string') throw new Error(`Wrong path type: ${path}`)
   const lastDot = path.lastIndexOf(".") + 1
   const pathWithoutLastKey = lastDot ? path.slice(0, lastDot - 1) : ''
   const lastKey = path.slice(lastDot)
   return [pathWithoutLastKey, lastKey]
}