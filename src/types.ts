import { LiteralIndex } from "./utilities/immutableImplementation";

/**
 * --------------------------------------------
 *  UTILITIES
 * --------------------------------------------
 */

/** Primitives and browser native objects. */
type PrimitivesAndNativeObjects = null | undefined | string | number | boolean | symbol | bigint | Date | FileList | File

/** Array indexes type. */
type ArrayIndexes = number | LiteralIndex

/** To check if a ReadonlyArray is a tuple or not. */
type IsTuple<T extends ReadonlyArray<any>> = number extends T['length'] ? false : true;

/**
 * --------------------------------------------
 *  DOT PATH IMPLEMENTATION
 * --------------------------------------------
 */

/** Dot-paths of an array. */
type ArrayPaths<TInnerType, TAllowedTypes> = TInnerType extends TAllowedTypes
   ? TInnerType extends PrimitivesAndNativeObjects
   ? number | `${ArrayIndexes}`
   : number | `${ArrayIndexes}` | `${ArrayIndexes}.${DotPaths<TInnerType, TAllowedTypes>}`
   : `${ArrayIndexes}.${DotPaths<TInnerType, TAllowedTypes>}`

/** Dot-paths of an object. */
type ObjectPaths<T, TAllowedTypes> = {
   [Key in keyof T & (string | number)]: T[Key] extends TAllowedTypes
   ? T[Key] extends PrimitivesAndNativeObjects
   ? `${Key}`
   : `${Key}` | `${Key}.${DotPaths<T[Key], TAllowedTypes>}`
   : `${Key}.${DotPaths<T[Key], TAllowedTypes>}`
}[keyof T & (string | number)]

/** Dot-paths of a tuple. */
type TuplePaths<T, TAllowedTypes> = ObjectPaths<Omit<T, keyof any[]>, TAllowedTypes>

/** Literal union of all posible dot-paths which satisfy provided types as second argument (default: any). */
export type DotPaths<T, TAllowedTypes = any> = T extends ReadonlyArray<infer U> ?
   IsTuple<T> extends true ? TuplePaths<T, TAllowedTypes> : ArrayPaths<U, TAllowedTypes>
   : T extends PrimitivesAndNativeObjects ? never : ObjectPaths<T, TAllowedTypes>


/**
 * --------------------------------------------
 *  VALUE OF A NESTED PROPERTY PROVIDING A DOT PATH
 * --------------------------------------------
 */

/** Nested type implementation. */
export type ValueInPath<TObject, TPath> =
   TPath extends keyof TObject ? TObject[TPath] :
   TPath extends '' ? TObject :
   TPath extends LiteralIndex ? never :
   TPath extends `${number}` ? TObject extends ReadonlyArray<infer U> ? U : never :
   TPath extends `${infer K}.${infer R}` ?
   K extends keyof TObject ? ValueInPath<TObject[K], R> :
   K extends LiteralIndex ? never :
   K extends `${number}` ? TObject extends ReadonlyArray<infer U> ? ValueInPath<U, R> : never :
   never : never


/**
 * --------------------------------------------
 *  RETURNED VALUE OF A NESTED PROPERTY PROVIDING A DOT PATH
 * --------------------------------------------
 */

/** Returned nested type implementation. */
export type ReturnedValueInPath<TObject, TPath> =
   TPath extends '' ? TObject :
   TPath extends keyof TObject ? TPath extends number ? TObject extends ReadonlyArray<infer U> ? (U | undefined) : TObject[TPath] : TObject[TPath] :
   TPath extends `${number}` ? TObject extends ReadonlyArray<infer U> ? (U | undefined) : never :
   TPath extends LiteralIndex ? never :
   TPath extends `${infer K}.${infer R}` ?
   K extends keyof TObject ? ReturnedValueInPath<TObject[K], R> :
   K extends LiteralIndex ? never :
   K extends `${number}` ? TObject extends ReadonlyArray<infer U> ? (ReturnedValueInPath<U, R> | undefined) : never : never : never


/**
 * --------------------------------------------
 *  UPDATE OBJECT WITH DOT PATH IMPLEMENTATION
 * --------------------------------------------
 */

/** Value of a dot-path update object, can be the value or a function. */
export type UpdateValue<TObject, TPath> = ValueInPath<TObject, TPath> | ((fieldValue: ValueInPath<TObject, TPath>) => ValueInPath<TObject, TPath>)

/** Dot-path update object, used to give updates to the updateImmutably function. */
export type UpdateObject<TObject, TPaths extends PropertyKey = DotPaths<TObject>> = {
   [TPath in TPaths]?: ValueInPath<TObject, TPath> | ((fieldValue: ValueInPath<TObject, TPath>) => ValueInPath<TObject, TPath>)
}


/**
 * --------------------------------------------
 *  EXTRACT TYPE FROM DOT-PATH UPDATE OBJECT
 * --------------------------------------------
 */

/** Merging two objects */
// type Merge<A, B> = { [K in keyof (A | B)]: K extends keyof B ? B[K] : A[K] };

/** Keys which arent dot-path keys */
type NonDotPathKeys<T> = { [Key in keyof T]: Key extends `${infer K}.${string}` ? K : Key }[keyof T]
/** Keys which are an index */
type KeysRepresentingAnIndex<T> = { [Key in keyof T]: Key extends `${number}.${string}` ? never : Key }[keyof T]
/** Keys which start with an index */
type KeyPathsStartingWithAnIndex<T> = { [Key in keyof T]: Key extends `${number}.${string}` ? Key : never }[keyof T]
/** Keys which are paths and its first key-path is removed */
type NestedPathKeys<T, K extends string | number> = { [Key in keyof T]: Key extends `${K}.${infer U}` ? U : never }[keyof T]
/** Extract value if its a function */
type Value<T> = T extends (...args: any) => any ? ReturnType<T> : T
/** To check if an empty object is provided */
type EmptyObject = Record<string | number | symbol, never>

/** Used to extract the type from a dot-path update object. */
export type ExtractTypeFromDotPathUpdateObject<T extends Record<string, any>> =
   T extends EmptyObject ? {} :
   keyof T extends LiteralIndex | number | `${number}` | `${number}.${infer U}`
   ? Value<T[KeyPathsStartingWithAnIndex<T>]> extends never
   ? Array<Value<T[KeysRepresentingAnIndex<T>]>>
   : Array<Value<T[KeysRepresentingAnIndex<T>]> | { [Key2 in U]: Value<T[KeyPathsStartingWithAnIndex<T>]> }>
   : {
      [Key1 in NonDotPathKeys<T> & string]: Key1 extends keyof T
      ? Value<T[Key1]> extends Array<infer U>
      ? ExtractTypeFromDotPathUpdateObject<{ [Key2 in NestedPathKeys<T, Key1>]: Value<T[`${Key1}.${Key2}`]> }> extends Array<infer W>
      ? Array<U | W>
      : Array<U> & ExtractTypeFromDotPathUpdateObject<{ [Key2 in NestedPathKeys<T, Key1>]: Value<T[`${Key1}.${Key2}`]> }>
      : Value<T[Key1]> //& ExtractTypeFromDotPathUpdateObject<{ [Key2 in NestedPathKeys<T, Key1>]: Value<T[`${Key1}.${Key2}`]> }>
      : ExtractTypeFromDotPathUpdateObject<{ [Key2 in NestedPathKeys<T, Key1>]: Value<T[`${Key1}.${Key2}`]> }>
   } & unknown

/** New expanded value after aplying updates including new properties */
export type ExtendedUpdate<
   TObject extends Record<string | number | symbol, any>,
   TDotPathUpdateObject extends Record<string | number | symbol, any>
> = TObject extends Array<infer U>
   ? ExtractTypeFromDotPathUpdateObject<TDotPathUpdateObject> extends Array<infer W>
   ? Array<U | W>
   : TObject & ExtractTypeFromDotPathUpdateObject<TDotPathUpdateObject>
   : ExtractTypeFromDotPathUpdateObject<TObject & TDotPathUpdateObject>
