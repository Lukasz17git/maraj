import { ObjectLiteral } from "./(strictness.types)"


/** Checks if any provided value is an object literal or not */
type IsObjectLiteral = (valueToTest: unknown) => valueToTest is ObjectLiteral
export const isObjectLiteral: IsObjectLiteral = (valueToTest: unknown): valueToTest is ObjectLiteral => !!valueToTest && Object.getPrototypeOf(valueToTest) === Object.prototype


// MUST BE TRUE TYPES
type Is01 = {} extends ObjectLiteral ? true : false
//   ^?
type Is02 = Record<PropertyKey, any> extends ObjectLiteral ? true : false
//   ^?
type Is03 = { a: 1, b: string } extends ObjectLiteral ? true : false
//   ^?
const symbol = Symbol()
type Is04 = { [symbol]: number } extends ObjectLiteral ? true : false
//   ^?
const objectExample1 = {}
const objectExample2 = { a: 1 }
const objectExample3 = { a: [''] }
const objectExample4 = { [symbol]: [''] }
type Is05 = typeof objectExample1 extends ObjectLiteral ? true : false
//   ^?
type Is06 = typeof objectExample2 extends ObjectLiteral ? true : false
//   ^?
type Is07 = typeof objectExample3 extends ObjectLiteral ? true : false
//   ^?
type Is08 = typeof objectExample4 extends ObjectLiteral ? true : false
//   ^?
type Is09 = ObjectLiteral extends ObjectLiteral ? true : false
//   ^?


// MUST BE FALSE TYPES
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
type Is12 = null extends ObjectLiteral ? true : false
//   ^?
type Is13 = undefined extends ObjectLiteral ? true : false
//   ^?
type Is14 = boolean extends ObjectLiteral ? true : false
//   ^?
type Is15 = symbol extends ObjectLiteral ? true : false
//   ^?
type Is16 = bigint extends ObjectLiteral ? true : false
//   ^?
type Is17 = RegExp extends ObjectLiteral ? true : false
//   ^?
type Is18 = void extends ObjectLiteral ? true : false
//   ^?
type Is19 = Map<any, any> extends ObjectLiteral ? true : false
//   ^?
type Is20 = Set<any> extends ObjectLiteral ? true : false
//   ^?
type Is21 = ReadonlyMap<any, any> extends ObjectLiteral ? true : false
//   ^?
type Is22 = ReadonlySet<any> extends ObjectLiteral ? true : false
//   ^?
type Is23 = ReadonlyArray<any> extends ObjectLiteral ? true : false
//   ^?

