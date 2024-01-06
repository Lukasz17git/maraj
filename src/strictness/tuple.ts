import { Tuple } from "./(strictness.types)"


// MUST BE TRUE TYPES
type Is01 = [string] extends Tuple ? true : false
//   ^?
type Is02 = [any] extends Tuple ? true : false
//   ^?
type Is03 = [null] extends Tuple ? true : false
//   ^?
const symbol = Symbol()
type Is04 = [symbol] extends Tuple ? true : false
//   ^?
type Is09 = Tuple extends Tuple ? true : false
//   ^?


// MUST BE FALSE TYPES
type Is3 = Date extends Tuple ? true : false
//   ^?
type Is4 = string extends Tuple ? true : false
//   ^?
type Is5 = number extends Tuple ? true : false
//   ^?
type Is6 = any[] extends Tuple ? true : false
//   ^?
type Is7 = [] extends Tuple ? true : false
//   ^?
type Is9 = ((...args: any[]) => any) extends Tuple ? true : false
//   ^?
type Is10 = Function extends Tuple ? true : false
//   ^?
type Is11 = File extends Tuple ? true : false
//   ^?
type Is12 = null extends Tuple ? true : false
//   ^?
type Is13 = undefined extends Tuple ? true : false
//   ^?
type Is14 = boolean extends Tuple ? true : false
//   ^?
type Is15 = symbol extends Tuple ? true : false
//   ^?
type Is16 = bigint extends Tuple ? true : false
//   ^?
type Is17 = RegExp extends Tuple ? true : false
//   ^?
type Is18 = void extends Tuple ? true : false
//   ^?
type Is19 = Map<any, any> extends Tuple ? true : false
//   ^?
type Is20 = Set<any> extends Tuple ? true : false
//   ^?
type Is21 = ReadonlyMap<any, any> extends Tuple ? true : false
//   ^?
type Is22 = ReadonlySet<any> extends Tuple ? true : false
//   ^?
type Is23 = ReadonlyArray<any> extends Tuple ? true : false
//   ^?