
/**
 * Spreads if its an object or array to the target, if its not then it sets its value
 */
export const spread = <T extends Array<any> | object>(
   currentValue: T,
   update: T extends Array<infer U> ? Array<U> : Partial<T>
) => {
   if (currentValue?.constructor === Object && update?.constructor === Object) return { ...currentValue, ...update }
   if (Array.isArray(currentValue) && Array.isArray(update)) return [...currentValue, ...update]
   return currentValue
}
