
/**
 * --------------------------------------------
 *  UTILITIES
 * --------------------------------------------
 */

export type PrimitivesAndNativeObjects = null | undefined | string | number | boolean | symbol | bigint | Date | FileList | File
export type LiteralIndex = '${number}'
type ArrayIndexes = `${number}` | LiteralIndex
type IsTuple<T extends ReadonlyArray<any>> = number extends T['length'] ? false : true;

/**
 * --------------------------------------------
 *  DOT PATH IMPLEMENTATION
 * --------------------------------------------
 */

type ArrayPaths<TInnerType, TAllowedTypes> = TInnerType extends TAllowedTypes
   ? TInnerType extends PrimitivesAndNativeObjects
   ? `${ArrayIndexes}`
   : `${ArrayIndexes}` | `${ArrayIndexes}.${Flatten<TInnerType, TAllowedTypes>}`
   : `${ArrayIndexes}.${Flatten<TInnerType, TAllowedTypes>}`

type ObjectPaths<T, TAllowedTypes> = {
   [Key in keyof T & string]: T[Key] extends TAllowedTypes
   ? T[Key] extends PrimitivesAndNativeObjects
   ? `${Key}`
   : `${Key}` | `${Key}.${Flatten<T[Key], TAllowedTypes>}`
   : `${Key}.${Flatten<T[Key], TAllowedTypes>}`
}[keyof T & string]

type TuplePaths<T, TAllowedTypes> = ObjectPaths<Omit<T, keyof any[]>, TAllowedTypes>

type Flatten<T, TAllowedTypes> = T extends ReadonlyArray<infer U> ?
   IsTuple<T> extends true ? TuplePaths<T, TAllowedTypes> : ArrayPaths<U, TAllowedTypes>
   : T extends PrimitivesAndNativeObjects ? never : ObjectPaths<T, TAllowedTypes>

export type DotPaths<T, TAllowedTypes = any> = Flatten<T, TAllowedTypes>


/**
 * --------------------------------------------
 *  TO KNOW IF A PATH IS INDEXING ARRAY OR NOT
 * --------------------------------------------
 */

// export type IsPathIndexingAnArray<T extends LiteralIndex | number> = `${T}` | `${T}.${string}` | `${string}.${T}` | `${string}.${T}.${string}`


/**
 * --------------------------------------------
 *  VALUE OF A NESTED PROPERTY PROVIDING A DOT PATH
 * --------------------------------------------
 */

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

export type ValueInDotPath<TObject, TPath extends DotPaths<TObject> | ''> = NestedType<TObject, TPath>

/**
 * --------------------------------------------
 *  RETURNED VALUE OF A NESTED PROPERTY PROVIDING A DOT PATH
 * --------------------------------------------
 */

type ReturnedNestedValue<TObject, TPath> =
   TPath extends '' ? TObject :
   TPath extends keyof TObject ? TObject[TPath] :
   TPath extends LiteralIndex ? never :
   TPath extends `${number}` ? TObject extends ReadonlyArray<infer U> ? (U | undefined) : never :
   TPath extends `${infer K}.${infer R}` ?
   K extends keyof TObject ? ReturnedNestedValue<TObject[K], R> :
   K extends LiteralIndex ? never :
   K extends `${number}` ? TObject extends ReadonlyArray<infer U> ? (ReturnedNestedValue<U, R> | undefined) : never : never : never

export type ReturnedValueInDotPath<TObject, TPath extends DotPaths<TObject> | ''> = ReturnedNestedValue<TObject, TPath>


/**
 * --------------------------------------------
 *  UPDATE OBJECT WITH DOT PATH IMPLEMENTATION
 * --------------------------------------------
 */

export type DotPathUpdateValue<TObject, TPath extends DotPaths<TObject>> = ValueInDotPath<TObject, TPath> | ((fieldValue: ValueInDotPath<TObject, TPath>, fullObject: TObject) => ValueInDotPath<TObject, TPath>)

export type DotPathUpdateObject<TObject> = {
   [TPath in DotPaths<TObject>]?: ValueInDotPath<TObject, TPath> | ((fieldValue: ValueInDotPath<TObject, TPath>, fullObject: TObject) => ValueInDotPath<TObject, TPath>)
}
const a: DotPathUpdateObject<{ a: string, b: [string, { name: string }], c: ({ last: string })[] }> = {
   'c.${number}': v => v
}

/**
 * --------------------------------------------
 *  REQUIRED OR OPTIONAL KEYS
 * --------------------------------------------
 */

type NonPartialKeys = null | object

export type RetrieveOptionalKeys<T> = {
   [K in keyof T & string]: T[K] extends NonPartialKeys ? never : K
}[keyof T & string]


export type RetrieveRequiredKeys<T> = {
   [K in keyof T & string]: T[K] extends NonPartialKeys ? K : never
}[keyof T & string]