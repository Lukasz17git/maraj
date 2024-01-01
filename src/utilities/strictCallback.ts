

export type StrictCallback<T> = (v: T) => [T, 'STRICTNESS RETURN ERROR: wrap the return value with the first parameter of the callback function']
export type StrictCallbackReturn<T> = [T, 'STRICTNESS RETURN ERROR: wrap the return value with the first parameter of the callback function'] & unknown

/** Parameter allowing to strictly check types for callback functions as arguments. It returns a tuple where the first index is the value you want as return type. */
export const strictCallback = <T>(v: T) => [v, 'STRICTNESS RETURN ERROR: wrap the return value with the first parameter of the callback function'] as StrictCallbackReturn<T>
