
type HasInstance = typeof Symbol.hasInstance // Function & File & Promise
type ToPrimitive = typeof Symbol.toPrimitive // Date
type Unscopables = typeof Symbol.unscopables // Array

type NonObjectLiteralKeys = Unscopables | HasInstance | ToPrimitive
export type ObjectLiteral = Record<PropertyKey, any> & { [K in NonObjectLiteralKeys]?: never }

/** Checks if any provided value is an object literal or not */
export const isObjectLiteral = (valueToTest: unknown): valueToTest is ObjectLiteral => !!valueToTest && Object.getPrototypeOf(valueToTest) === Object.prototype

// VALID TYPES
type Is = {} extends ObjectLiteral ? true : false
//   ^?
type Is0 = Record<PropertyKey, any> extends ObjectLiteral ? true : false
//   ^?
type Is1 = { a: 1, b: string } extends ObjectLiteral ? true : false
//   ^?
const symbol = Symbol()
type Is2 = { [symbol]: number } extends ObjectLiteral ? true : false
//   ^?
const objectExample1 = {}
const objectExample2 = { a: 1 }
const objectExample3 = { a: [''] }
const objectExample4 = { [symbol]: [''] }
type Is21 = typeof objectExample1 extends ObjectLiteral ? true : false
//   ^?
type Is22 = typeof objectExample2 extends ObjectLiteral ? true : false
//   ^?
type Is23 = typeof objectExample3 extends ObjectLiteral ? true : false
//   ^?
type Is24 = typeof objectExample4 extends ObjectLiteral ? true : false
//   ^?


// FALSY TYPES
type Is3 = Date extends ObjectLiteral ? true : false
//   ^?
type Is4 = string extends ObjectLiteral ? true : false
//   ^?
type Is5 = number extends ObjectLiteral ? true : false
//   ^?
type Is6 = any[] extends ObjectLiteral ? true : false
//   ^?
type Is7 = [] extends ObjectLiteral ? true : false
//   ^?
type Is8 = [string] extends ObjectLiteral ? true : false
//   ^?
type Is9 = ((...args: any[]) => any) extends ObjectLiteral ? true : false
//   ^?
type Is10 = Function extends ObjectLiteral ? true : false
//   ^?
type Is11 = File extends ObjectLiteral ? true : false
//   ^?