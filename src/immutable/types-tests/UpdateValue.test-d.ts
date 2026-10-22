import { it, describe, expectTypeOf } from 'vitest'
import { UpdateValue } from '../(immutable.types)'
import { Strict } from '../../strictness/(strictness.types)'

type Address = { city: string, zip: string }
type User = {
   name: string
   address: Address
   items: { id: number }[]
}

describe("UpdateValue test", () => {

   it('should accept the new value or a function that gets the current one', () => {
      expectTypeOf<UpdateValue<User, 'name'>>().toEqualTypeOf<string | ((fieldValue: string) => string)>()
      expectTypeOf<UpdateValue<User, 'items.0.id'>>().toEqualTypeOf<number | ((fieldValue: number) => number)>()
   })

   it('should require the function to return a Strict object when the value is an object', () => {
      expectTypeOf<UpdateValue<User, 'address'>>().toEqualTypeOf<Address | ((fieldValue: Address) => Strict<Address>)>()
      expectTypeOf<UpdateValue<User, 'items.0'>>().toEqualTypeOf<{ id: number } | ((fieldValue: { id: number }) => Strict<{ id: number }>)>()
   })

   it('should return never for paths that don\'t exist', () => {
      expectTypeOf<UpdateValue<User, 'nope'>>().toBeNever()
      expectTypeOf<UpdateValue<User, 'address.nope'>>().toBeNever()
   })
})
