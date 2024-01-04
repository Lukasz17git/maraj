/**
 * Prettify
 */
type Prettify<T extends Record<PropertyKey, any>> = { [K in keyof T]: T[K] }

/**
 * ObjectLiteral Implementation
 */

type Iterator = typeof Symbol.iterator // Set & Map & ReadonlySet & ReadonlyMap & ReadonlyArray
type HasInstance = typeof Symbol.hasInstance // Function & File & Promise
type ToPrimitive = typeof Symbol.toPrimitive // Date
type Unscopables = typeof Symbol.unscopables // Array
type MatchAll = typeof Symbol.matchAll // RegExp

type NonObjectLiteralKeys = Unscopables | HasInstance | ToPrimitive | MatchAll | Iterator
export type ObjectLiteral = Record<PropertyKey, any> & { [K in NonObjectLiteralKeys]?: never }


/**
 * Strict Implementation
 */

/** Strict key */
declare const strict: unique symbol

/** Remove Strictness */
type NonStrictObject<T extends ObjectLiteral> = { [Key in Exclude<keyof T, typeof strict>]: T[Key] } & {}

/** Apply Strictness */
type StrictObject<T extends ObjectLiteral = ObjectLiteral> = Prettify<{ [strict]: Exclude<keyof T, typeof strict> } & NonStrictObject<T>>






type Example = { a: 1, b: 2, c: null, d: { d1: '' } }

type StrictExample = StrictObject<Example>
//    ^?
type NonStrictExample = NonStrictObject<Example>
//    ^?

const aaa = (v: Example) => v
aaa({} as StrictExample)

type MyArr = StrictObject<Record<PropertyKey, any>>
//    ^?
type MyArr2 = { [K in keyof MyArr]: MyArr[K] }
//    ^?


type IsLiteral = Example extends ObjectLiteral ? true : false
//    ^?
type IsStrict = Example extends StrictObject ? true : false
//    ^?


