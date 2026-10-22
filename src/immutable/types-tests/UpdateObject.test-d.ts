import { it, describe, expectTypeOf } from 'vitest'
import { DotPaths, UpdateObject, UpdateValue } from '../(immutable.types)'

type User = {
   name: string
   address: { city: string }
   tags: string[]
}

type UserUpdateObject = UpdateObject<User>

describe("UpdateObject test", () => {

   it('should have an optional key for every dot path, with its UpdateValue', () => {
      expectTypeOf<keyof UserUpdateObject>().toEqualTypeOf<DotPaths<User>>()
      expectTypeOf<UserUpdateObject['address.city']>().toEqualTypeOf<UpdateValue<User, 'address.city'> | undefined>()
      expectTypeOf<{}>().toExtend<UserUpdateObject>()
   })

   it('should have only the given paths when they are passed', () => {
      expectTypeOf<UpdateObject<User, 'name' | 'tags'>>().toEqualTypeOf<{
         name?: UpdateValue<User, 'name'>
         tags?: UpdateValue<User, 'tags'>
      }>()
   })

   it('should accept updates by value, by function and by array index', () => {
      expectTypeOf<{ name: string }>().toExtend<UserUpdateObject>()
      expectTypeOf<{ 'address.city': (city: string) => string }>().toExtend<UserUpdateObject>()
      expectTypeOf<{ 'tags.0': string, 'tags.1': string }>().toExtend<UserUpdateObject>()
   })

   it('should reject unknown paths, wrong values and the literal \'${number}\'', () => {
      /* only object literals check for unknown keys, like the one passed to update() */
      // @ts-expect-error
      const unknownPath: UserUpdateObject = { 'address.country': 'Spain' }

      expectTypeOf<{ 'address.city': number }>().not.toExtend<UserUpdateObject>()
      expectTypeOf<{ 'address.city': (city: string) => number }>().not.toExtend<UserUpdateObject>()
      expectTypeOf<{ 'tags.${number}': string }>().not.toExtend<UserUpdateObject>()
   })
})
