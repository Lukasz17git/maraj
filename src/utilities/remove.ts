
/**
 * Removes properties or indexes, order doesn't matter.
 */
export const remove = <T extends Array<any> | object>(
   value: T,
   _keys: T extends any[] ? (number | `${number}` | (number | `${number}`)[])
      : (keyof T | (keyof T)[])
): T => {

   if (!Array.isArray(value) && value?.constructor !== Object) throw 'Wrong type provided in "remove" function'

   let keys = Array.isArray(_keys) ? _keys : [_keys]

   if (Array.isArray(value)) {
      const uniqueSymbol = Symbol()
      const copy = [...value]
      // @ts-ignore: doesnt matter if the provided key doesnt exist
      keys.forEach((key) => { copy[key] = uniqueSymbol })
      const update = copy.filter((v) => v !== uniqueSymbol)
      // @ts-ignore: should return T type
      return update
   }

   const update = { ...value }
   // @ts-ignore: doesnt matter if the provided key doesnt exist
   keys.forEach(key => delete update[key])
   return update
}