/**
 * Paths implementation
 */

type PrimitivesAndNativeObjects = null | undefined | string | number | boolean | symbol | bigint | Date | FileList | File

type IsTuple<T extends ReadonlyArray<any>> = number extends T['length'] ? false : true;

export type Index = '_INDEX_'
type RootArrayPathEnum = `${number}` | Index
type ArrayPathEnum<TLength extends boolean> = TLength extends true ? RootArrayPathEnum | 'length' : RootArrayPathEnum
type ArrayPaths<TInnerType, TLength extends boolean> = `${ArrayPathEnum<TLength>}` | `${ArrayPathEnum<false>}.${RootFlatten<TInnerType, TLength>}`

type FilteredTuple<T, TLength> = TLength extends string ? Omit<T, Exclude<keyof any[], 'length'>> : Omit<T, keyof any[]>

type ObjectPaths<T, TLength extends boolean> = { [Key in keyof T & string]: `${Key}` | `${Key}.${RootFlatten<T[Key], TLength>}` }[keyof T & string]

type RootFlatten<T, TIncludeLength extends boolean> = T extends ReadonlyArray<infer U> ?
   IsTuple<T> extends true ? ObjectPaths<FilteredTuple<T, TIncludeLength>, TIncludeLength> : ArrayPaths<U, TIncludeLength>
   : T extends string ? TIncludeLength extends true ? 'length' : never
   : T extends PrimitivesAndNativeObjects ? never : ObjectPaths<T, TIncludeLength>

export type DotPaths<T> = RootFlatten<T, false>
export type DotPathsIncludingLength<T> = RootFlatten<T, true>


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

export type UpdateDotPathValue<
   TObject extends object,
   TPath extends DotPaths<TObject>
> = ValueInDotPath<TObject, TPath> | ((value: ValueInDotPath<TObject, TPath>) => ValueInDotPath<TObject, TPath>)

/**
 * Update Object Type Implementation
 */
export type UpdateDotPathObject<TObject extends object> = Partial<{
   [TKey in DotPaths<TObject>]: TKey extends PathIndexingArray<Index>
   ? [`TS PATH ERROR: replace _INDEX_ with {NUMBER}`, UpdateDotPathValue<TObject, TKey>]
   : UpdateDotPathValue<TObject, TKey>
}>