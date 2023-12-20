
/**
 * Paths implementation
 */
type PrimitivesAndNativeObjects = null | undefined | string | number | boolean | symbol | bigint | Date | FileList | File

type IsTuple<T extends ReadonlyArray<any>> = number extends T['length'] ? false : true;

type Index = '_INDEX_'
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
export type DotPathsWithLength<T> = RootFlatten<T, true>

/**
 * Nested Property Type implementation
 */
type NonStrictNestedProperty<TObject, TPath extends string> =
   TPath extends '' ? TObject
   : TPath extends keyof TObject ? TObject[TPath]
   : TPath extends `${number}` | Index ? TObject extends Array<infer U> ? TPath extends `${number}.${infer K}` ? K extends keyof U ? NonStrictNestedProperty<U, K> : never : U : never
   : TPath extends `${infer K}.${infer R}` ? K extends keyof TObject ? NonStrictNestedProperty<Required<TObject>[K], R> : K extends `${number}` | Index ? TObject extends Array<infer U> ? NonStrictNestedProperty<U, R> : never : never
   : never

export type ValueInDotPath<TObject, TPath extends DotPaths<TObject> | ''> = NonStrictNestedProperty<TObject, TPath>

/**
 * Update Object Type Implementation
 */
export type DotPathUpdateObject<T> = Partial<{
   [K in DotPaths<T>]: K extends `${string}.${Index}${string}`
   ? [`TS PATH ERROR: replace _INDEX_ with {NUMBER}`, ValueInDotPath<T, K>, ((value: ValueInDotPath<T, K>) => ValueInDotPath<T, K>)]
   : ValueInDotPath<T, K> | ((value: ValueInDotPath<T, K>) => ValueInDotPath<T, K>)
}>