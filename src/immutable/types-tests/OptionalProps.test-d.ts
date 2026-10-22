import { it, describe, expectTypeOf } from 'vitest'
import { DotPaths, ValueInPath, ReturnedValueInPath, UpdateObject } from '../(immutable.types)'
import { ExtendedArrayIndexes as Index, KeyOf, Strict } from '../../strictness/(strictness.types)'

/**
 * --------------------------------------------
 *  OPTIONAL AND NULLABLE PROPS
 * --------------------------------------------
 */

type Profile = {
   nickname?: string
   address?: { city: string, zip?: string }
   manager: { name: string } | null
   backup: { email: string } | undefined
   tags?: string[]
   orders?: { id: number, note?: string }[]
   point: [number, number?]
}
type ProfileDotPaths = DotPaths<Profile>
type ProfileStringDotPaths = DotPaths<Profile, string>

type DeepOptional = { a?: { b?: { c?: { d: number } } } }
type DeepOptionalDotPaths = DotPaths<DeepOptional>


describe("OptionalProps test", () => {

   it('should list optional props without adding undefined to the keys', () => {
      expectTypeOf<KeyOf<Profile>>().toEqualTypeOf<'nickname' | 'address' | 'manager' | 'backup' | 'tags' | 'orders' | 'point'>()
      expectTypeOf<KeyOf<Partial<{ id: number, name: string }>>>().toEqualTypeOf<'id' | 'name'>()
      expectTypeOf<KeyOf<Strict<Profile>>>().toEqualTypeOf<KeyOf<Profile>>()
      expectTypeOf<KeyOf<[number, number?]>>().toEqualTypeOf<'0' | '1'>()
   })

   it('should list the paths inside optional, null and undefined objects (address.city, manager.name)', () => {
      expectTypeOf<ProfileDotPaths>().toEqualTypeOf<
         | 'nickname'
         | 'address' | 'address.city' | 'address.zip'
         | 'manager' | 'manager.name'
         | 'backup' | 'backup.email'
         | 'tags' | `tags.${Index}`
         | 'orders' | `orders.${Index}` | `orders.${Index}.id` | `orders.${Index}.note`
         | 'point' | 'point.0' | 'point.1'
      >()
      expectTypeOf<DeepOptionalDotPaths>().toEqualTypeOf<'a' | 'a.b' | 'a.b.c' | 'a.b.c.d'>()
   })

   it('should count optional props as their type when filtering by type (nickname is a string)', () => {
      expectTypeOf<KeyOf<Profile, string>>().toEqualTypeOf<'nickname'>()
      expectTypeOf<ProfileStringDotPaths>().toEqualTypeOf<
         | 'nickname' | 'address.city' | 'address.zip' | 'manager.name' | 'backup.email'
         | `tags.${Index}` | `orders.${Index}.note`
      >()
   })

   it('should return the value to set inside optional and nullable objects, without undefined or null', () => {
      expectTypeOf<ValueInPath<Profile, 'address.city'>>().toEqualTypeOf<string>()
      expectTypeOf<ValueInPath<Profile, 'manager.name'>>().toEqualTypeOf<string>()
      expectTypeOf<ValueInPath<Profile, 'backup.email'>>().toEqualTypeOf<string>()
      expectTypeOf<ValueInPath<Profile, 'orders.0.id'>>().toEqualTypeOf<number>()
      expectTypeOf<ValueInPath<DeepOptional, 'a.b.c.d'>>().toEqualTypeOf<number>()
   })

   it('should keep undefined and null on the optional or nullable prop itself', () => {
      expectTypeOf<ValueInPath<Profile, 'nickname'>>().toEqualTypeOf<string | undefined>()
      expectTypeOf<ValueInPath<Profile, 'address.zip'>>().toEqualTypeOf<string | undefined>()
      expectTypeOf<ValueInPath<Profile, 'manager'>>().toEqualTypeOf<{ name: string } | null>()
      expectTypeOf<ValueInPath<Profile, 'point.1'>>().toEqualTypeOf<number | undefined>()
   })

   it('should return undefined from select() when an object in the path is missing', () => {
      expectTypeOf<ReturnedValueInPath<Profile, 'address.city'>>().toEqualTypeOf<string | undefined>()
      expectTypeOf<ReturnedValueInPath<Profile, 'manager.name'>>().toEqualTypeOf<string | undefined>()
      expectTypeOf<ReturnedValueInPath<Profile, 'backup.email'>>().toEqualTypeOf<string | undefined>()
      expectTypeOf<ReturnedValueInPath<Profile, 'orders.0.id'>>().toEqualTypeOf<number | undefined>()
      expectTypeOf<ReturnedValueInPath<DeepOptional, 'a.b.c.d'>>().toEqualTypeOf<number | undefined>()
      expectTypeOf<ReturnedValueInPath<Profile, 'manager'>>().toEqualTypeOf<{ name: string } | null>()
   })

   it('should let update() set paths inside optional and nullable objects', () => {
      const updates: UpdateObject<Profile> = {
         'address.city': 'Madrid',
         'manager.name': 'Ana',
         'backup.email': 'ana@mail.com',
         'orders.0.id': 1,
         'manager': null,
      }
      expectTypeOf(updates).toExtend<UpdateObject<Profile>>()

      // @ts-expect-error
      const wrongValue: UpdateObject<Profile> = { 'address.city': 1 }
      // @ts-expect-error
      const nullInsideObject: UpdateObject<Profile> = { 'manager.name': null }
   })
})
