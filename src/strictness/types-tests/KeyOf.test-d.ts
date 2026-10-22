import { it, describe, expectTypeOf } from 'vitest'
import { ExtendedArrayIndexes, KeyOf, Strict } from '../(strictness.types)'

type User = { name: string, age: number, address: { city: string } }

describe("KeyOf test", () => {

   it('should return the keys of an object', () => {
      expectTypeOf<KeyOf<User>>().toEqualTypeOf<'name' | 'age' | 'address'>()
      expectTypeOf<KeyOf<{}>>().toBeNever()
   })

   it('should leave out the strict key of a Strict object', () => {
      expectTypeOf<KeyOf<Strict<User>>>().toEqualTypeOf<'name' | 'age' | 'address'>()
   })

   it('should return the positions of a tuple (\'0\' | \'1\')', () => {
      expectTypeOf<KeyOf<[number, string]>>().toEqualTypeOf<'0' | '1'>()
      expectTypeOf<KeyOf<readonly [number, string]>>().toEqualTypeOf<'0' | '1'>()
   })

   it('should return ExtendedArrayIndexes for arrays', () => {
      expectTypeOf<KeyOf<string[]>>().toEqualTypeOf<ExtendedArrayIndexes>()
      expectTypeOf<KeyOf<readonly string[]>>().toEqualTypeOf<ExtendedArrayIndexes>()
   })

   it('should return only the keys whose value has the allowed type', () => {
      expectTypeOf<KeyOf<User, string>>().toEqualTypeOf<'name'>()
      expectTypeOf<KeyOf<User, object>>().toEqualTypeOf<'address'>()
      expectTypeOf<KeyOf<[number, string], number>>().toEqualTypeOf<'0'>()
      expectTypeOf<KeyOf<string[], string>>().toEqualTypeOf<ExtendedArrayIndexes>()
      expectTypeOf<KeyOf<string[], number>>().toBeNever()
   })

   it('should return never for primitives, Dates, Files, Blobs, Promises and functions', () => {
      expectTypeOf<KeyOf<string>>().toBeNever()
      expectTypeOf<KeyOf<null>>().toBeNever()
      expectTypeOf<KeyOf<Date>>().toBeNever()
      expectTypeOf<KeyOf<File>>().toBeNever()
      expectTypeOf<KeyOf<Blob>>().toBeNever()
      expectTypeOf<KeyOf<Promise<string>>>().toBeNever()
      expectTypeOf<KeyOf<() => void>>().toBeNever()
   })
})
