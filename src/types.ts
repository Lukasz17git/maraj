/**
 * Paths implementation
 */

type PrimitivesAndNativeObjects = null | undefined | string | number | boolean | symbol | bigint | Date | FileList | File

type IsTuple<T extends ReadonlyArray<any>> = number extends T['length'] ? false : true;

export type Index = '_INDEX_'
type ArrayIndexPaths = `${number}` | Index
type ArrayPaths<TInnerType> = `${ArrayIndexPaths}` | `${ArrayIndexPaths}.${Flatten<TInnerType>}`

type ObjectPaths<T> = {
   [Key in keyof T & string]: `${Key}` | `${Key}.${Flatten<T[Key]>}`
}[keyof T & string]

type TuplePaths<T> = ObjectPaths<Omit<T, keyof any[]>>

type Flatten<T> = T extends ReadonlyArray<infer U> ?
   IsTuple<T> extends true ? TuplePaths<T> : ArrayPaths<U>
   : T extends PrimitivesAndNativeObjects ? never : ObjectPaths<T>

export type DotPaths<T extends object> = Flatten<T>


/**
 * Type to know when a path is indexing an array
 */

export type PathIndexingArray<T extends string | number> = `${T}` | `${T}.${string}` | `${string}.${T}` | `${string}.${T}.${string}`


/**
 * Nested Property Type implementation
 */

type NestedProperty<TObject, TPath extends string> =
   TPath extends '' ? TObject
   : TPath extends keyof TObject ? TObject[TPath]
   : TPath extends (`${number}` | Index) ? TObject extends Array<infer U> ? TPath extends `${number}.${infer K}` ? K extends keyof U ? NestedProperty<U, K> : never : U : never
   : TPath extends `${infer K}.${infer R}` ? K extends keyof TObject ? NestedProperty<Required<TObject>[K], R> : K extends `${number}` | Index ? TObject extends Array<infer U> ? NestedProperty<U, R> : never : never
   : never

export type ValueInDotPath<
   TObject extends object,
   TPath extends DotPaths<TObject> | ''
> = NestedProperty<TObject, TPath>

export type DotPathUpdateValue<
   TObject extends object,
   TPath extends DotPaths<TObject>
> = TPath extends PathIndexingArray<Index>
   ? [`PATH ERROR: replace _INDEX_ with a NUMBER`, ValueInDotPath<TObject, TPath>, ((fieldValue: ValueInDotPath<TObject, TPath>, fullObject: TObject) => ValueInDotPath<TObject, TPath>)]
   : ValueInDotPath<TObject, TPath> | ((fieldValue: ValueInDotPath<TObject, TPath>, fullObject: TObject) => ValueInDotPath<TObject, TPath>)

/**
 * Update Object Type Implementation
 */
export type DotPathUpdateObject<TObject extends object> = {
   [TKey in DotPaths<TObject>]?: DotPathUpdateValue<TObject, TKey>
}

/**
 * Optional and Required keys
 */

type NonPartialKeys = string | number | boolean | symbol | bigint | null | object

export type OptionalKeys<T> = {
   [K in keyof T & string]: T[K] extends NonPartialKeys ? never : K
}[keyof T & string]

export type RequiredKeys<T> = {
   [K in keyof T & string]: T[K] extends NonPartialKeys ? K : never
}[keyof T & string]