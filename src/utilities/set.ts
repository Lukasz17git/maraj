
type Set = <T>(newValue: T) => (value: T) => T

/**
 * Allows to set strongly typed values (removing inacurate "undefined" inference) in nested values inside arrays
 */
export const set: Set = (newValue) => () => newValue