import { DotPaths } from "../immutable/(immutable.types)"
import { LITERAL_INDEX } from "./literalIndex"

/** Primitives and browser native objects. */
export type PrimitivesAndNativeObjects = null | undefined | string | number | boolean | symbol | bigint | Date | FileList | File | Blob

/** Tuple type, it has to have at least property "0" */
export type Tuple = ReadonlyArray<any> & { "0": any }

/** Array indexes type. */
export type LiteralIndex = typeof LITERAL_INDEX
export type ExtendedArrayIndexes = number | `${number}` | LiteralIndex

/** Object Literal, File and Blob still match it (they have no symbol to reject them by) */
export type ObjectLiteral = {
   [x: string]: any; // Record
   [x: number]: any; // Record
   [x: symbol]: any; // Record
   [Symbol.iterator]?: never; // Set & Map & ReadonlySet & ReadonlyMap & ReadonlyArray & FileList
   [Symbol.toPrimitive]?: never; // Date
   [Symbol.hasInstance]?: never; // Function
   [Symbol.unscopables]?: never; // Array
   [Symbol.matchAll]?: never; // RegExp
   [Symbol.toStringTag]?: never; // Promise & WeakMap & ArrayBuffer & Uint8Array
}

/** Strict key */
declare const strictSymbol: unique symbol
export type Strict<T> = T extends PrimitivesAndNativeObjects ? T : T extends ObjectLiteral ? T & { [strictSymbol]: DotPaths<T> } : T

/** Smart KeyOf (doesnt include the "strict" key) */
export type KeyOf<T, TAllowedValuesInKeys = any> =
   T extends PrimitivesAndNativeObjects ? never
   : T extends ObjectLiteral ? T extends Strict<infer U> ? KeysOfObject<U, TAllowedValuesInKeys> : KeysOfObject<T, TAllowedValuesInKeys>
   : T extends Tuple ? KeysOfObject<Omit<T, keyof any[]>, TAllowedValuesInKeys>
   : T extends ReadonlyArray<infer U> ? U extends TAllowedValuesInKeys ? ExtendedArrayIndexes : never
   : never

type KeysOfObject<T, TAllowedValuesInKeys> = { [Key in keyof T]-?: Required<T>[Key] extends TAllowedValuesInKeys ? Key : never }[keyof T]

