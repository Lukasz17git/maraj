
/**
 * --------------------------------------------
 *  UTILITIES
 * --------------------------------------------
 */

/** Primitives and browser native objects. */
export type PrimitivesAndNativeObjects = null | undefined | string | number | boolean | symbol | bigint | Date | FileList | File

/** Index literal type to improve DX at managing updates. */
export type LiteralIndex = '${number}'

/** Array indexes type. */
type ArrayIndexes = `${number}` | LiteralIndex

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
   ? `${ArrayIndexes}`
   : `${ArrayIndexes}` | `${ArrayIndexes}.${DotPaths<TInnerType, TAllowedTypes>}`
   : `${ArrayIndexes}.${DotPaths<TInnerType, TAllowedTypes>}`

/** Dot-paths of an object. */
type ObjectPaths<T, TAllowedTypes> = {
   [Key in keyof T & string]: T[Key] extends TAllowedTypes
   ? T[Key] extends PrimitivesAndNativeObjects
   ? `${Key}`
   : `${Key}` | `${Key}.${DotPaths<T[Key], TAllowedTypes>}`
   : `${Key}.${DotPaths<T[Key], TAllowedTypes>}`
}[keyof T & string]

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
type NestedType<TObject, TPath> =
   TPath extends '' ? TObject :
   TPath extends keyof TObject ? TObject[TPath] :
   TPath extends LiteralIndex ? never :
   TPath extends `${number}` ? TObject extends ReadonlyArray<infer U> ? U : never :
   TPath extends `${infer K}.${infer R}` ?
   K extends keyof TObject ? NestedType<TObject[K], R> :
   K extends LiteralIndex ? never :
   K extends `${number}` ? TObject extends ReadonlyArray<infer U> ? NestedType<U, R> : never :
   never : never

/** Value of a nested property of a given dot-path. */
export type ValueInDotPath<TObject, TPath extends DotPaths<TObject> | ''> = NestedType<TObject, TPath>


/**
 * --------------------------------------------
 *  RETURNED VALUE OF A NESTED PROPERTY PROVIDING A DOT PATH
 * --------------------------------------------
 */

/** Returned nested type implementation. */
type ReturnedNestedValue<TObject, TPath> =
   TPath extends '' ? TObject :
   TPath extends keyof TObject ? TObject[TPath] :
   TPath extends LiteralIndex ? never :
   TPath extends `${number}` ? TObject extends ReadonlyArray<infer U> ? (U | undefined) : never :
   TPath extends `${infer K}.${infer R}` ?
   K extends keyof TObject ? ReturnedNestedValue<TObject[K], R> :
   K extends LiteralIndex ? never :
   K extends `${number}` ? TObject extends ReadonlyArray<infer U> ? (ReturnedNestedValue<U, R> | undefined) : never : never : never


/** Value of a RETURNED nested property of a given dot-path (so when accessing arrays can be undefined). */
export type ReturnedValueInDotPath<TObject, TPath extends DotPaths<TObject> | ''> = ReturnedNestedValue<TObject, TPath>


/**
 * --------------------------------------------
 *  UPDATE OBJECT WITH DOT PATH IMPLEMENTATION
 * --------------------------------------------
 */

/** Value of a dot-path update object, can be the value or a function. */
export type DotPathUpdateValue<TObject, TPath extends DotPaths<TObject>> = ValueInDotPath<TObject, TPath> | ((fieldValue: ValueInDotPath<TObject, TPath>, fullObject: TObject) => ValueInDotPath<TObject, TPath>)

/** Dot-path update object, used to give updates to the updateImmutably function. */
export type DotPathUpdateObject<TObject> = {
   [TPath in DotPaths<TObject>]?: ValueInDotPath<TObject, TPath> | ((fieldValue: ValueInDotPath<TObject, TPath>, fullObject: TObject) => ValueInDotPath<TObject, TPath>)
}


/**
 * --------------------------------------------
 *  REQUIRED OR OPTIONAL KEYS
 * --------------------------------------------
 */

/** All types instead of undefined. */
type NonPartialKeys = null | object

/** Returns only the optional keys of an object. */
export type RetrieveOptionalKeys<T> = {
   [K in keyof T & string]: T[K] extends NonPartialKeys ? never : K
}[keyof T & string]

/** Returns only the required keys of an object. */
export type RetrieveRequiredKeys<T> = {
   [K in keyof T & string]: T[K] extends NonPartialKeys ? K : never
}[keyof T & string]




/**
 * --------------------------------------------
 *  TO KNOW IF A PATH IS INDEXING ARRAY OR NOT
 * --------------------------------------------
 */

// export type IsPathIndexingAnArray<T extends LiteralIndex | number> = `${T}` | `${T}.${string}` | `${string}.${T}` | `${string}.${T}.${string}`
