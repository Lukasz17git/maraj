import { DotPaths } from "../immutable/(immutable.types)"
import { Prettify, SmartKeyOf } from "../utilities/(utility.types)"

/**
 * ObjectLiteral Implementation
 */

// type Iterator = typeof Symbol.iterator // Set & Map & ReadonlySet & ReadonlyMap & ReadonlyArray
// type HasInstance = typeof Symbol.hasInstance // Function & File & Promise
// type ToPrimitive = typeof Symbol.toPrimitive // Date
// type Unscopables = typeof Symbol.unscopables // Array
// type MatchAll = typeof Symbol.matchAll // RegExp

// type NonObjectLiteralKeys = Unscopables | HasInstance | ToPrimitive | MatchAll | Iterator


/**
 * --------------------------------------------
 *  OBJECT LITERAL
 * --------------------------------------------
 */

/** Object Literal */
export type ObjectLiteral = {
   [x: string]: any; // Record
   [x: number]: any; // Record
   [x: symbol]: any; // Record
   [Symbol.iterator]?: never; // Set & Map & ReadonlySet & ReadonlyMap & ReadonlyArray
   [Symbol.toPrimitive]?: never; // Function & File & Promise
   [Symbol.hasInstance]?: never; // Date
   [Symbol.unscopables]?: never; // Array
   [Symbol.matchAll]?: never; // RegExp
}


/**
 * Strict Implementation
 */

/** Strict key */
declare const strict: unique symbol
type StrictKeySymbol = typeof strict

/** Strict and nonStrict object literal */
type NonStrictifiedObject = ObjectLiteral & { [strict]?: never }
export type StrictifiedObject = ObjectLiteral & { [strict]: PropertyKey }

/** UnStrictify */
export type UnStrictify<T extends StrictifiedObject> = { [Key in Exclude<keyof T, StrictKeySymbol>]: T[Key] } //& {}

/** Strictify */
type Strictified<T extends NonStrictifiedObject> = Prettify<{ [strict]: DotPaths<T> } & T>

/** Strict Omit */
type StrictifiedOmit<
   TObject extends StrictifiedObject,
   TKeysToRemove extends (TAllowOnlyExistentKeys extends true ? keyof TObject : (keyof TObject | string & {} | number & {} | symbol & {})) = never,
   TAllowOnlyExistentKeys extends boolean = true
> = Strictified<{
   [Key in Exclude<keyof TObject, TKeysToRemove | StrictKeySymbol>]: TObject[Key]
}>

/** StrictifiedPick */
type StrictifiedPick<
   TObject extends StrictifiedObject,
   TKeysToPick extends SmartKeyOf<TObject>
> = Strictified<{
   [Key in TKeysToPick]: TObject[Key];
}>

/** StrictifiedIntersection */
type StrictifiedIntersection<
   TObject extends StrictifiedObject,
   TObjectToAdd extends NonStrictifiedObject
> = Strictified<UnStrictify<TObject> & TObjectToAdd>

