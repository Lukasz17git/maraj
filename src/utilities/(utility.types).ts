import { ObjectLiteral, StrictifiedObject, UnStrictify } from "../strictness/(strictness.types)"
import { LITERAL_INDEX } from "./literalIndex"

/**
 * --------------------------------------------
 *  UTILITIES
 * --------------------------------------------
 */

/** Primitives and browser native objects. */
export type PrimitivesAndNativeObjects = null | undefined | string | number | boolean | symbol | bigint | Date | FileList | File

/** Tuple type, it has to have at least property "0" */
export type Tuple = ReadonlyArray<any> & { "0": any }

/** Array indexes type. */
export type LiteralIndex = typeof LITERAL_INDEX
export type ExtendedArrayIndexes = number | `${number}` | LiteralIndex

/** Smart KeyOf (doesnt include the "strict" key) */
export type SmartKeyOf<T, TAllowedValuesInKeys = any> =
   T extends ReadonlyArray<infer U> ? U extends TAllowedValuesInKeys ?
   T extends Tuple ? KeysOfObject<Omit<T, keyof any[]>> : ExtendedArrayIndexes : never
   : T extends StrictifiedObject ? KeysOfObject<UnStrictify<T>>
   : T extends ObjectLiteral ? KeysOfObject<T> : never

type KeysOfObject<T, TAllowedValuesInKeys = any> = { [Key in keyof T]: T[Key] extends TAllowedValuesInKeys ? Key : never }[keyof T]

/** Prettify */
export type Prettify<T extends Record<PropertyKey, any>> = { [K in keyof T]: T[K] }