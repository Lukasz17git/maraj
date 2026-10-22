import { it, describe, expectTypeOf } from 'vitest'
import { ObjectLiteral } from '../(strictness.types)'

interface User { name: string }

describe("ObjectLiteral test", () => {

   it('should match plain objects, records and interfaces', () => {
      const symbol = Symbol()
      const objectExample = { a: [''] }
      expectTypeOf<{}>().toExtend<ObjectLiteral>()
      expectTypeOf<{ a: 1, b: string }>().toExtend<ObjectLiteral>()
      expectTypeOf<{ [symbol]: number }>().toExtend<ObjectLiteral>()
      expectTypeOf<typeof objectExample>().toExtend<ObjectLiteral>()
      expectTypeOf<Record<PropertyKey, any>>().toExtend<ObjectLiteral>()
      expectTypeOf<User>().toExtend<ObjectLiteral>()
      expectTypeOf<ObjectLiteral>().toExtend<ObjectLiteral>()
   })

   it('should not match Promises, WeakMaps, ArrayBuffers or typed arrays (Uint8Array)', () => {
      expectTypeOf<Promise<string>>().not.toExtend<ObjectLiteral>()
      expectTypeOf<WeakMap<object, any>>().not.toExtend<ObjectLiteral>()
      expectTypeOf<ArrayBuffer>().not.toExtend<ObjectLiteral>()
      expectTypeOf<Uint8Array>().not.toExtend<ObjectLiteral>()
   })

   it('should not match arrays, tuples, functions, Dates, Maps, Sets or primitives', () => {
      expectTypeOf<any[]>().not.toExtend<ObjectLiteral>()
      expectTypeOf<ReadonlyArray<any>>().not.toExtend<ObjectLiteral>()
      expectTypeOf<[]>().not.toExtend<ObjectLiteral>()
      expectTypeOf<[string]>().not.toExtend<ObjectLiteral>()
      expectTypeOf<(...args: any[]) => any>().not.toExtend<ObjectLiteral>()
      expectTypeOf<Function>().not.toExtend<ObjectLiteral>()
      expectTypeOf<Date>().not.toExtend<ObjectLiteral>()
      expectTypeOf<RegExp>().not.toExtend<ObjectLiteral>()
      expectTypeOf<Map<any, any>>().not.toExtend<ObjectLiteral>()
      expectTypeOf<Set<any>>().not.toExtend<ObjectLiteral>()
      expectTypeOf<ReadonlyMap<any, any>>().not.toExtend<ObjectLiteral>()
      expectTypeOf<ReadonlySet<any>>().not.toExtend<ObjectLiteral>()
      expectTypeOf<string>().not.toExtend<ObjectLiteral>()
      expectTypeOf<number>().not.toExtend<ObjectLiteral>()
      expectTypeOf<boolean>().not.toExtend<ObjectLiteral>()
      expectTypeOf<symbol>().not.toExtend<ObjectLiteral>()
      expectTypeOf<bigint>().not.toExtend<ObjectLiteral>()
      expectTypeOf<null>().not.toExtend<ObjectLiteral>()
      expectTypeOf<undefined>().not.toExtend<ObjectLiteral>()
      expectTypeOf<void>().not.toExtend<ObjectLiteral>()
   })
})
