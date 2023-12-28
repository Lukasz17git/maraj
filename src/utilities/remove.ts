

/** Returns only the optional keys of an object. */
type OptionalKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? K : never }[keyof T];


/** Removes properties or indexes, order doesn't matter. */
type Remove = <T extends object>(
   value: T,
   keys: T extends any[] ? (number | `${number}` | (number | `${number}`)[])
      : OptionalKeys<T> | (OptionalKeys<T>)[]
) => T


/**
 * Removes properties or indexes, order doesn't matter.
 * @param value Object/array from where to remove keys/indexes shallowly.
 * @param keys Keys to remove.
 * @returns New object/array without the provided keys/indexes.
 */
export const remove: Remove = (value, keys): typeof value => {

   if (!Array.isArray(value) && value?.constructor !== Object) throw 'Wrong type provided in "remove" function'

   let keysAsArray = Array.isArray(keys) ? keys : [keys]

   if (Array.isArray(value)) {
      const uniqueSymbol = Symbol()
      const copy = [...value]
      keysAsArray.forEach((key) => { copy[key] = uniqueSymbol })
      const update = copy.filter((v) => v !== uniqueSymbol) as typeof value
      return update
   }

   const update = { ...value }
   keysAsArray.forEach(key => delete update[key])
   return update
}