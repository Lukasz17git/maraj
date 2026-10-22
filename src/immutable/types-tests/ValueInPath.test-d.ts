import { it, describe, expectTypeOf } from 'vitest'
import { ValueInPath } from '../(immutable.types)'

type User = {
   name: string
   age?: number
   address: { city: string, zip: string | null }
   tags: string[]
   items: { id: number, name: string }[]
   point: [number, string]
}

describe("ValueInPath test", () => {

   it('should return the value at the end of the path', () => {
      expectTypeOf<ValueInPath<User, 'name'>>().toEqualTypeOf<string>()
      expectTypeOf<ValueInPath<User, 'address'>>().toEqualTypeOf<{ city: string, zip: string | null }>()
      expectTypeOf<ValueInPath<User, 'address.zip'>>().toEqualTypeOf<string | null>()
      expectTypeOf<ValueInPath<User, 'point.0'>>().toEqualTypeOf<number>()
      expectTypeOf<ValueInPath<User, 'point.1'>>().toEqualTypeOf<string>()
   })

   it('should return the whole object for the path \'\'', () => {
      expectTypeOf<ValueInPath<User, ''>>().toEqualTypeOf<User>()
   })

   it('should return the array item for an index (0, \'0\' or `${number}`), without undefined', () => {
      expectTypeOf<ValueInPath<string[], 0>>().toEqualTypeOf<string>()
      expectTypeOf<ValueInPath<string[], '0'>>().toEqualTypeOf<string>()
      expectTypeOf<ValueInPath<User, 'tags.0'>>().toEqualTypeOf<string>()
      expectTypeOf<ValueInPath<User, 'items.1.name'>>().toEqualTypeOf<string>()
      expectTypeOf<ValueInPath<User, `items.${number}.id`>>().toEqualTypeOf<number>()
   })

   it('should keep undefined in optional props (age?: number -> number | undefined)', () => {
      expectTypeOf<ValueInPath<User, 'age'>>().toEqualTypeOf<number | undefined>()
   })

   it('should return never for paths that don\'t exist or use the literal \'${number}\'', () => {
      expectTypeOf<ValueInPath<User, 'nope'>>().toBeNever()
      expectTypeOf<ValueInPath<User, 'address.nope'>>().toBeNever()
      expectTypeOf<ValueInPath<User, 'tags.${number}'>>().toBeNever()
      expectTypeOf<ValueInPath<User, 'items.${number}.name'>>().toBeNever()
   })

   it('should return never for a position a tuple doesn\'t have (point.5), but not for rest items', () => {
      expectTypeOf<ValueInPath<User, 'point.5'>>().toBeNever()
      expectTypeOf<ValueInPath<[number, { a: string }], '5.a'>>().toBeNever()
      expectTypeOf<ValueInPath<[number, { a: string }], '1.a'>>().toEqualTypeOf<string>()
      expectTypeOf<number>().toExtend<ValueInPath<[string, ...number[]], '5'>>()
   })
})
