
type Set = <T>(newValue: T) => (v: unknown) => T

/**
 * Allows to set strongly typed values (removing inacurate "undefined" inference) in nested values inside arrays.
 * @param newValue New value.
 * @returns The same value.
 */

export const set: Set = (newValue) => () => newValue