import { it, describe, expectTypeOf } from 'vitest'
import { Strict } from '../(strictness.types)'

type Address = { city: string }
type AddressWithZip = { city: string, zip: string }

describe("Strict test", () => {

   it('should keep everything but object literals as they are', () => {
      expectTypeOf<Strict<string>>().toEqualTypeOf<string>()
      expectTypeOf<Strict<null>>().toEqualTypeOf<null>()
      expectTypeOf<Strict<Date>>().toEqualTypeOf<Date>()
      expectTypeOf<Strict<File>>().toEqualTypeOf<File>()
      expectTypeOf<Strict<Blob>>().toEqualTypeOf<Blob>()
      expectTypeOf<Strict<Promise<string>>>().toEqualTypeOf<Promise<string>>()
      expectTypeOf<Strict<string[]>>().toEqualTypeOf<string[]>()
      expectTypeOf<Strict<[number, string]>>().toEqualTypeOf<[number, string]>()
   })

   it('should keep the props of an object and still be usable as it', () => {
      expectTypeOf<Strict<Address>>().toExtend<Address>()
      expectTypeOf<Strict<Address>['city']>().toEqualTypeOf<string>()
      expectTypeOf<keyof Strict<Address>>().toExtend<PropertyKey>()
   })

   it('should reject the plain object, so it has to go through strict()', () => {
      expectTypeOf<Address>().not.toExtend<Strict<Address>>()
   })

   it('should reject a strict object with extra props (zip), unlike plain objects', () => {
      expectTypeOf<AddressWithZip>().toExtend<Address>()
      expectTypeOf<Strict<AddressWithZip>>().not.toExtend<Strict<Address>>()
   })
})
