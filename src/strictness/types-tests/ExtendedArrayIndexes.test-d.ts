import { it, describe, expectTypeOf } from 'vitest'
import { ExtendedArrayIndexes, LiteralIndex } from '../(strictness.types)'

describe("ExtendedArrayIndexes test", () => {

   it('should accept numbers and number strings (0, \'0\', \'12\')', () => {
      expectTypeOf<0>().toExtend<ExtendedArrayIndexes>()
      expectTypeOf<number>().toExtend<ExtendedArrayIndexes>()
      expectTypeOf<'0'>().toExtend<ExtendedArrayIndexes>()
      expectTypeOf<'12'>().toExtend<ExtendedArrayIndexes>()
      expectTypeOf<`${number}`>().toExtend<ExtendedArrayIndexes>()
   })

   it('should accept LiteralIndex, the literal \'${number}\'', () => {
      expectTypeOf<LiteralIndex>().toEqualTypeOf<'${number}'>()
      expectTypeOf<LiteralIndex>().toExtend<ExtendedArrayIndexes>()
   })

   it('should reject strings that aren\'t numbers (\'\', \'x\', \'1a\')', () => {
      expectTypeOf<''>().not.toExtend<ExtendedArrayIndexes>()
      expectTypeOf<'x'>().not.toExtend<ExtendedArrayIndexes>()
      expectTypeOf<'1a'>().not.toExtend<ExtendedArrayIndexes>()
      expectTypeOf<string>().not.toExtend<ExtendedArrayIndexes>()
   })
})
