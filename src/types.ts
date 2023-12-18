
/**
 * Paths implementation
 */
type PrimitivesAndNativeObjects = null | undefined | string | number | boolean | symbol | bigint | Date | FileList | File

type IsTuple<T extends ReadonlyArray<any>> = number extends T['length'] ? false : true;

type RootArrayPathEnum = `${number}` | '${index}'
type ArrayPathEnum<TLength extends boolean> = TLength extends true ? RootArrayPathEnum | 'length' : RootArrayPathEnum
type ArrayPaths<TInnerType, TLength extends boolean> = `${ArrayPathEnum<TLength>}` | `${ArrayPathEnum<false>}.${RootFlatten<TInnerType, TLength>}`

type FilteredTuple<T, TLength> = TLength extends string ? Omit<T, Exclude<keyof any[], 'length'>> : Omit<T, keyof any[]>

type ObjectPaths<T, TLength extends boolean> = { [Key in keyof T & string]: `${Key}` | `${Key}.${RootFlatten<T[Key], TLength>}` }[keyof T & string]

type RootFlatten<T, TIncludeLength extends boolean> = T extends ReadonlyArray<infer U> ?
   IsTuple<T> extends true ? ObjectPaths<FilteredTuple<T, TIncludeLength>, TIncludeLength> : ArrayPaths<U, TIncludeLength>
   : T extends string ? TIncludeLength extends true ? 'length' : never
   : T extends PrimitivesAndNativeObjects ? never : ObjectPaths<T, TIncludeLength>

export type DotPaths<T> = RootFlatten<T, false> | ''
export type DotPathsWithLength<T> = RootFlatten<T, true> | ''

/**
 * Nested Property Type implementation
 */
type NonStrictNestedProperty<TObject, TPath extends string> =
   TPath extends '' ? TObject
   : TPath extends keyof TObject ? TObject[TPath]
   : TPath extends `${number}` | '${index}' ? TObject extends Array<infer U> ? TPath extends `${number}.${infer K}` ? K extends keyof U ? NonStrictNestedProperty<U, K> : never : U : never
   : TPath extends `${infer K}.${infer R}` ? K extends keyof TObject ? NonStrictNestedProperty<Required<TObject>[K], R> : K extends `${number}` | '${index}' ? TObject extends Array<infer U> ? NonStrictNestedProperty<U, R> : never : never
   : never

export type ValueInDotPath<TObject, TPath extends DotPaths<TObject>> = NonStrictNestedProperty<TObject, TPath>


/**
 * Update Object Type Implementation
 */
export type DotPathUpdateObject<T> = {
   [K in DotPaths<T>]?: ValueInDotPath<T, K> | ((currentValue: ValueInDotPath<T, K>) => ValueInDotPath<T, K>)
}