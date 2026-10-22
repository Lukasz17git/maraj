import { it, describe, expectTypeOf } from 'vitest'
import { Tuple } from '../(strictness.types)'

describe("Tuple test", () => {

   it('should match tuples with at least 1 item', () => {
      const symbol = Symbol()
      expectTypeOf<[string]>().toExtend<Tuple>()
      expectTypeOf<[any]>().toExtend<Tuple>()
      expectTypeOf<[null]>().toExtend<Tuple>()
      expectTypeOf<[typeof symbol]>().toExtend<Tuple>()
      expectTypeOf<[number, string]>().toExtend<Tuple>()
      expectTypeOf<readonly [1, 2]>().toExtend<Tuple>()
      expectTypeOf<Tuple>().toExtend<Tuple>()
   })

   it('should not match arrays, the empty tuple [] or other values', () => {
      expectTypeOf<any[]>().not.toExtend<Tuple>()
      expectTypeOf<ReadonlyArray<any>>().not.toExtend<Tuple>()
      expectTypeOf<[]>().not.toExtend<Tuple>()
      expectTypeOf<Date>().not.toExtend<Tuple>()
      expectTypeOf<string>().not.toExtend<Tuple>()
      expectTypeOf<number>().not.toExtend<Tuple>()
      expectTypeOf<boolean>().not.toExtend<Tuple>()
      expectTypeOf<symbol>().not.toExtend<Tuple>()
      expectTypeOf<bigint>().not.toExtend<Tuple>()
      expectTypeOf<null>().not.toExtend<Tuple>()
      expectTypeOf<undefined>().not.toExtend<Tuple>()
      expectTypeOf<void>().not.toExtend<Tuple>()
      expectTypeOf<(...args: any[]) => any>().not.toExtend<Tuple>()
      expectTypeOf<Function>().not.toExtend<Tuple>()
      expectTypeOf<File>().not.toExtend<Tuple>()
      expectTypeOf<RegExp>().not.toExtend<Tuple>()
      expectTypeOf<Map<any, any>>().not.toExtend<Tuple>()
      expectTypeOf<Set<any>>().not.toExtend<Tuple>()
      expectTypeOf<ReadonlyMap<any, any>>().not.toExtend<Tuple>()
      expectTypeOf<ReadonlySet<any>>().not.toExtend<Tuple>()
   })
})
