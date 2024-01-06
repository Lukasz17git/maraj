
// /* Error showing the fix */
// type StrictCallbackError = "CALLBACK STRICTNESS RETURN ERROR: return the value using the first parameter"
// type StrictCallbackValue<T> = [StrictCallbackError, T]
// type StrictCallbackFunction<T> = (v: T) => StrictCallbackValue<T>

// /** Apply strictness to a callback function */
// export type StrictCallback<T extends (...args: any[]) => any> = (
//    r: StrictCallbackFunction<ReturnType<T>>,
//    ...args: Parameters<T>
// ) => [StrictCallbackError, ReturnType<T>]


// type UnsealStrictCallback = <TCallback extends (r: StrictCallbackFunction<any>, ...args: any[]) => any>(callback: TCallback) => (
//    ...args: Parameters<TCallback> extends [infer _, ...infer RestParams] ? RestParams : never
// ) => ReturnType<TCallback>['1']

// /** Extract the callback from */
// export const unsealStrictCallback: UnsealStrictCallback = (callback) => (...args) => callback(v => v, ...args)
