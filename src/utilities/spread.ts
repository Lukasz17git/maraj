
type Spread = <T extends object>(
   value: T,
   update: T extends Array<infer U> ? Array<U> : Partial<T>
) => T

/**
 * Spreads if its an object or array to the target, if its not then returns same value
 */
export const spread: Spread = (value, update) => {
   if (value?.constructor === Object && update?.constructor === Object) return { ...value, ...update } as typeof value
   if (Array.isArray(value) && Array.isArray(update)) return [...value, ...update] as typeof value
   return value
}