
/**
 * --------------------------------------------
 *  OLD VERSION OF DOT PATH IMPLEMENTATION
 * --------------------------------------------
 */

// type ArrayPaths<TInnerType> = `${ArrayIndexPaths}` | `${ArrayIndexPaths}.${Flatten<TInnerType>}`

// type ObjectPaths<T> = {
//    [Key in keyof T & string]: `${Key}` | `${Key}.${Flatten<T[Key]>}`
// }[keyof T & string]

// type TuplePaths<T> = ObjectPaths<Omit<T, keyof any[]>>

// type Flatten<T> = T extends ReadonlyArray<infer U> ?
//    IsTuple<T> extends true ? TuplePaths<T> : ArrayPaths<U>
//    : T extends PrimitivesAndNativeObjects ? never : ObjectPaths<T>

// export type DotPaths<T> = Flatten<T>


/**
 * --------------------------------------------
 *  UTILITIES
 * --------------------------------------------
 */

export type PrimitivesAndNativeObjects = null | undefined | string | number | boolean | symbol | bigint | Date | FileList | File
export type Index = '_INDEX_'
type ArrayIndexPaths = `${number}` | Index
type IsTuple<T extends ReadonlyArray<any>> = number extends T['length'] ? false : true;

/**
 * --------------------------------------------
 *  DOT PATH IMPLEMENTATION
 * --------------------------------------------
 */

type ArrayPaths<TInnerType, TAllowedTypes> = TInnerType extends TAllowedTypes
   ? TInnerType extends PrimitivesAndNativeObjects
   ? `${ArrayIndexPaths}`
   : `${ArrayIndexPaths}` | `${ArrayIndexPaths}.${Flatten<TInnerType, TAllowedTypes>}`
   : `${ArrayIndexPaths}.${Flatten<TInnerType, TAllowedTypes>}`

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

export type IsPathIndexingAnArray<T extends Index | number> = `${T}` | `${T}.${string}` | `${string}.${T}` | `${string}.${T}.${string}`


/**
 * --------------------------------------------
 *  VALUE OF A NESTED PROPERTY PROVIDING A DOT PATH
 * --------------------------------------------
 */

type NestedProperty<TObject, TPath> =
   TPath extends '' ? TObject
   : TPath extends keyof TObject ? TObject[TPath]
   : TPath extends (`${number}` | Index) ? TObject extends Array<infer U> ? TPath extends `${number}.${infer K}` ? K extends keyof U ? NestedProperty<U, K> : never : U : never
   : TPath extends `${infer K}.${infer R}` ? K extends keyof TObject ? NestedProperty<Required<TObject>[K], R> : K extends `${number}` | Index ? TObject extends Array<infer U> ? NestedProperty<U, R> : never : never
   : never

export type ValueInDotPath<
   TObject,
   TPath extends DotPaths<TObject> | ''
> = NestedProperty<TObject, TPath>

export type DotPathUpdateValue<
   TObject,
   TPath extends DotPaths<TObject>
> = TPath extends IsPathIndexingAnArray<Index>
   ? [`PATH ERROR: replace _INDEX_ with a NUMBER`, ValueInDotPath<TObject, TPath>, ((fieldValue: ValueInDotPath<TObject, TPath>, fullObject: TObject) => ValueInDotPath<TObject, TPath>)]
   : ValueInDotPath<TObject, TPath> | ((fieldValue: ValueInDotPath<TObject, TPath>, fullObject: TObject) => ValueInDotPath<TObject, TPath>)

/**
 * --------------------------------------------
 *  UPDATE OBJECT WITH DOT PATH IMPLEMENTATION
 * --------------------------------------------
 */

export type DotPathUpdateObject<TObject> = {
   [TKey in DotPaths<TObject>]?: DotPathUpdateValue<TObject, TKey>
}

/**
 * --------------------------------------------
 *  REQUIRED OR OPTIONALA KEYS
 * --------------------------------------------
 */

type NonPartialKeys = null | object

export type OptionalKeys<T> = {
   [K in keyof T & string]: T[K] extends NonPartialKeys ? never : K
}[keyof T & string]


export type RequiredKeys<T> = {
   [K in keyof T & string]: T[K] extends NonPartialKeys ? K : never
}[keyof T & string]