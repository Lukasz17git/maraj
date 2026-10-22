import { it, describe, expectTypeOf } from 'vitest'
import { ExtendedUpdate } from '../(immutable.types)'

describe("ExtendedUpdate test", () => {

   it('should keep the object as it is when there are no updates', () => {
      expectTypeOf<ExtendedUpdate<{ a: number }, {}>>().toEqualTypeOf<{ a: number }>()
   })

   it('should add the new props to the object', () => {
      /* .branded compares { a } & { b } as { a, b }; without it they never match */
      expectTypeOf<ExtendedUpdate<{ a: number }, { b: string }>>().branded.toEqualTypeOf<{ a: number, b: string }>()
      expectTypeOf<ExtendedUpdate<{ a: number }, { 'c.d': string }>>().branded.toEqualTypeOf<{ a: number, c: { d: string } }>()
   })

   it('should add new nested props next to the existing ones (\'a.y\' -> { a: { x, y } })', () => {
      expectTypeOf<ExtendedUpdate<{ a: { x: number } }, { 'a.y': string }>>().branded.toEqualTypeOf<{ a: { x: number, y: string } }>()
   })

   it('should add the new item types to arrays (string[] + { \'3\': number } -> (string | number)[])', () => {
      expectTypeOf<ExtendedUpdate<string[], { '3': number }>>().toEqualTypeOf<(string | number)[]>()
   })
})
