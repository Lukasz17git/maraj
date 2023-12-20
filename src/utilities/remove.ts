
type Remove = <T extends object>(
   value: T,
   keys: T extends any[] ? (number | `${number}` | (number | `${number}`)[])
      : (keyof T | (keyof T)[])
) => T

/**
 * Removes properties or indexes, order doesn't matter.
 */
export const remove: Remove = (value, keys): typeof value => {

   if (!Array.isArray(value) && value?.constructor !== Object) throw 'Wrong type provided in "remove" function'

   let keysAsArray = Array.isArray(keys) ? keys : [keys]

   if (Array.isArray(value)) {
      const uniqueSymbol = Symbol()
      const copy = [...value]
      // @ts-ignore: doesnt matter if the provided key doesnt exist
      keysAsArray.forEach((key) => { copy[key] = uniqueSymbol })
      const update = copy.filter((v) => v !== uniqueSymbol)
      // @ts-ignore: should return T type
      return update
   }

   const update = { ...value }
   // @ts-ignore: doesnt matter if the provided key doesnt exist
   keysAsArray.forEach(key => delete update[key])
   return update
}