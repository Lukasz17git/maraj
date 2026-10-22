import { it, describe, expectTypeOf } from 'vitest'
import { ReturnedValueInPath } from '../(immutable.types)'

type User = {
   name: string
   age?: number
   address: { city: string }
   tags: string[]
   items: { id: number, name: string }[]
   point: [number, string]
}

describe("ReturnedValueInPath test", () => {

   it('should return the value at the end of the path', () => {
      expectTypeOf<ReturnedValueInPath<User, 'name'>>().toEqualTypeOf<string>()
      expectTypeOf<ReturnedValueInPath<User, 'address.city'>>().toEqualTypeOf<string>()
      expectTypeOf<ReturnedValueInPath<User, 'age'>>().toEqualTypeOf<number | undefined>()
   })

   it('should return the whole object for the path \'\'', () => {
      expectTypeOf<ReturnedValueInPath<User, ''>>().toEqualTypeOf<User>()
   })

   it('should add undefined after an array index, since it may be out of range (tags.0 -> string | undefined)', () => {
      expectTypeOf<ReturnedValueInPath<string[], 0>>().toEqualTypeOf<string | undefined>()
      expectTypeOf<ReturnedValueInPath<string[], '0'>>().toEqualTypeOf<string | undefined>()
      expectTypeOf<ReturnedValueInPath<User, 'tags.0'>>().toEqualTypeOf<string | undefined>()
      expectTypeOf<ReturnedValueInPath<User, 'items.1.name'>>().toEqualTypeOf<string | undefined>()
   })

   it('should not add undefined after a tuple position (point.1 -> string)', () => {
      expectTypeOf<ReturnedValueInPath<User, 'point.0'>>().toEqualTypeOf<number>()
      expectTypeOf<ReturnedValueInPath<User, 'point.1'>>().toEqualTypeOf<string>()
   })

   it('should return never for paths that don\'t exist or use the literal \'${number}\'', () => {
      expectTypeOf<ReturnedValueInPath<User, 'nope'>>().toBeNever()
      expectTypeOf<ReturnedValueInPath<User, 'address.nope'>>().toBeNever()
      expectTypeOf<ReturnedValueInPath<User, 'items.${number}.name'>>().toBeNever()
   })

   it('should return never for a position a tuple doesn\'t have (point.5), but not for rest items', () => {
      expectTypeOf<ReturnedValueInPath<User, 'point.5'>>().toBeNever()
      expectTypeOf<ReturnedValueInPath<[number, { a: string }], '5.a'>>().toBeNever()
      expectTypeOf<ReturnedValueInPath<[number, { a: string }], '1.a'>>().toEqualTypeOf<string>()
      expectTypeOf<number>().toExtend<ReturnedValueInPath<[string, ...number[]], '5'>>()
   })
})
