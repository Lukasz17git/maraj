import { it, describe, expectTypeOf } from 'vitest'
import { ExtractTypeFromDotPathUpdateObject } from '../(immutable.types)'

describe("ExtractTypeFromDotPathUpdateObject test", () => {

   it('should return {} for an empty update object', () => {
      expectTypeOf<ExtractTypeFromDotPathUpdateObject<{}>>().toEqualTypeOf<{}>()
   })

   it('should keep keys without dots as they are', () => {
      expectTypeOf<ExtractTypeFromDotPathUpdateObject<{ a: number, b: string }>>().toEqualTypeOf<{ a: number, b: string }>()
   })

   it('should turn dot paths into nested objects (\'a.b.c.d\' -> { a: { b: { c: { d } } } })', () => {
      expectTypeOf<ExtractTypeFromDotPathUpdateObject<{ 'a.b': number }>>().toEqualTypeOf<{ a: { b: number } }>()
      expectTypeOf<ExtractTypeFromDotPathUpdateObject<{ 'a.b.c.d': number }>>().toEqualTypeOf<{ a: { b: { c: { d: number } } } }>()
   })

   it('should merge paths that share a key (\'a.b\' and \'a.c\' -> { a: { b, c } })', () => {
      expectTypeOf<ExtractTypeFromDotPathUpdateObject<{ 'a.b': number, 'a.c': string, d: boolean }>>()
         .toEqualTypeOf<{ a: { b: number, c: string }, d: boolean }>()
   })

   it('should use the return type of function updates', () => {
      expectTypeOf<ExtractTypeFromDotPathUpdateObject<{ a: () => number }>>().toEqualTypeOf<{ a: number }>()
   })

   it('should turn index keys into arrays (\'0\' -> string[], \'0.name\' -> { name }[])', () => {
      expectTypeOf<ExtractTypeFromDotPathUpdateObject<{ '0': string }>>().toEqualTypeOf<string[]>()
      expectTypeOf<ExtractTypeFromDotPathUpdateObject<{ '0.name': string }>>().toEqualTypeOf<{ name: string }[]>()
      expectTypeOf<ExtractTypeFromDotPathUpdateObject<{ '0': string, '1.name': string }>>().toEqualTypeOf<(string | { name: string })[]>()
   })

   it('should add index updates to the item type of an array (list.0 -> (string | number)[])', () => {
      expectTypeOf<ExtractTypeFromDotPathUpdateObject<{ list: string[], 'list.0': number }>>().toEqualTypeOf<{ list: (string | number)[] }>()
   })
})
