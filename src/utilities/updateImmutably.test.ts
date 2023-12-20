// @ts-nocheck
import { it, describe, expect } from 'vitest'
import { updateImmutably } from './updateImmutably'
import { spread } from './spread'

const arrayExample = ['0', 1, { value: 2 }, '3']
const objectExample = {
   name: 'test object',
   testingPurpose: true,
   data: {
      nestedData: {
         deep: 'this is deep field'
      },
      arrayExample: [{ name: 'example 1' }, { name: 'example 2' }]
   },
   tuple: ['one', 'two'] as [string, string]
}

describe("updateImmutably test", () => {
   it('should throw if a provided path doesnt exist', () => {
      expect(() => updateImmutably(true)).toThrow()
      expect(() => updateImmutably(1)).toThrow()
      expect(() => updateImmutably('str')).toThrow()
      expect(() => updateImmutably(new Date())).toThrow()
      expect(() => updateImmutably(null)).toThrow()
      expect(() => updateImmutably()).toThrow()
   })

   it('should return same copy of the value if empty update object', () => {
      expect(updateImmutably(objectExample, {})).toEqual(objectExample)
      expect(updateImmutably(objectExample, {})).toSatisfy((newValue) => newValue.tuple === objectExample.tuple)
      expect(updateImmutably(arrayExample, {})).toEqual(arrayExample)
      expect(updateImmutably(arrayExample, {})).toSatisfy((newValue) => newValue[2] === arrayExample[2])
   })

   it('should throw if the provided path is wrong', () => {
      expect(() => updateImmutably(objectExample, { "data.nestedData.nonexistent": 'any value' })).toThrow()
      expect(() => updateImmutably(objectExample, { "data.nestedData.nonexistent": v => v })).toThrow()
   })

   it('should throw if the index doesnt exist in array', () => {
      expect(() => updateImmutably(objectExample, { "data.arrayExample.100.name": 'any value' })).toThrow()
      expect(() => updateImmutably(objectExample, { "data.arrayExample.2": { name: 'new name' } })).toThrow()
   })

   it('should create a copy with the updated value', () => {
      expect(updateImmutably(objectExample, { name: 'new' })).toEqual({ ...objectExample, ...{ name: 'new' } })
      expect(updateImmutably(objectExample, { name: 'new' })).toSatisfy((newValue) => newValue.tuple === objectExample.tuple)
      expect(updateImmutably(objectExample, { name: v => v.slice(0, 1) })).toEqual({ ...objectExample, ...{ name: objectExample.name.slice(0, 1) } })

      const copy: typeof objectExample = JSON.parse(JSON.stringify(objectExample))
      copy.data.nestedData.deep = 'new'
      expect(updateImmutably(objectExample, { "data.nestedData.deep": 'new' })).toEqual(copy)
      expect(updateImmutably(objectExample, { "data.nestedData.deep": 'new' })).toSatisfy((newValue) => newValue.tuple === objectExample.tuple)

      const copy2: typeof objectExample = JSON.parse(JSON.stringify(objectExample))
      copy2.tuple[0] = 'new'
      expect(updateImmutably(objectExample, { "tuple.0": 'new' })).toEqual(copy2)
      expect(updateImmutably(objectExample, { "data.nestedData.deep": 'new' })).toSatisfy((newValue) => newValue.tuple === objectExample.tuple)

      const copy3: typeof objectExample = JSON.parse(JSON.stringify(objectExample))
      copy3.data.arrayExample[0].name = 'new'
      expect(updateImmutably(objectExample, { "data.arrayExample.0.name": 'new' })).toEqual(copy3)
      expect(updateImmutably(objectExample, { "data.nestedData.deep": 'new' })).toSatisfy((newValue) => newValue.tuple === objectExample.tuple)

      const copy4: typeof objectExample = JSON.parse(JSON.stringify(objectExample))
      copy4.data.arrayExample = [...copy4.data.arrayExample, { name: 'example 3' }]

      expect(updateImmutably(objectExample, { "data.arrayExample": (v) => spread(v, [{ name: 'example 3' }]) })).toEqual(copy4)
      expect(updateImmutably(objectExample, { "data.nestedData": v => v.deep })).toSatisfy((newValue) => newValue.tuple === objectExample.tuple)

   })

})