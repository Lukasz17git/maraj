
type Iterator = typeof Symbol.iterator // Set & Map & ReadonlySet & ReadonlyMap & ReadonlyArray
type HasInstance = typeof Symbol.hasInstance // Function & File & Promise
type ToPrimitive = typeof Symbol.toPrimitive // Date
type Unscopables = typeof Symbol.unscopables // Array
type MatchAll = typeof Symbol.matchAll // RegExp

type NonObjectLiteralKeys = Unscopables | HasInstance | ToPrimitive | MatchAll | Iterator

export type ObjectLiteral = Record<PropertyKey, any> & { [K in NonObjectLiteralKeys]?: never }


// Does it need to be strict?, i think so


//StrictRecord

