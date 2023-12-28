// @ts-nocheck
import { it, describe, expect } from 'vitest'
import { update } from './immutableImplementation'

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

describe("update test", () => {
   it('should throw if a provided path doesnt exist', () => {
      expect(() => update(true)).toThrow()
      expect(() => update(1)).toThrow()
      expect(() => update('str')).toThrow()
      expect(() => update(new Date())).toThrow()
      expect(() => update(null)).toThrow()
      expect(() => update()).toThrow()
   })

   it('should return same copy of the value if empty update object', () => {
      expect(update(objectExample, {})).toEqual(objectExample)
      expect(update(objectExample, {})).toSatisfy((newValue) => newValue.tuple === objectExample.tuple)
      expect(update(arrayExample, {})).toEqual(arrayExample)
      expect(update(arrayExample, {})).toSatisfy((newValue) => newValue[2] === arrayExample[2])
   })

   it('should add new property if the provided path is doesnt exist beforehand', () => {
      expect(update(objectExample, { "nonexistent": 'new' })).toEqual({ ...objectExample, nonexistent: 'new' })
      expect(update(objectExample, { "nonexistent": v => v })).toEqual({ ...objectExample, nonexistent: undefined })
   })

   // it('should add new value/prop in array if the index/path doesnt exist beforehand', () => {
   //    expect(update(objectExample, { "data.arrayExample.100.name": 'any value' })).
   //    expect(update(objectExample, { "data.arrayExample.2": { name: 'new name' } })).
   // })

   it('should create a copy with the updated value', () => {
      expect(update(objectExample, { name: 'new' })).toEqual({ ...objectExample, ...{ name: 'new' } })
      expect(update(objectExample, { name: 'new' })).toSatisfy((newValue) => newValue.tuple === objectExample.tuple)
      expect(update(objectExample, { name: v => v.slice(0, 1) })).toEqual({ ...objectExample, ...{ name: objectExample.name.slice(0, 1) } })

      const copy: typeof objectExample = JSON.parse(JSON.stringify(objectExample))
      copy.data.nestedData.deep = 'new'
      expect(update(objectExample, { "data.nestedData.deep": 'new' })).toEqual(copy)
      expect(update(objectExample, { "data.nestedData.deep": 'new' })).toSatisfy((newValue) => newValue.tuple === objectExample.tuple)

      const copy2: typeof objectExample = JSON.parse(JSON.stringify(objectExample))
      copy2.tuple[0] = 'new'
      expect(update(objectExample, { "tuple.0": 'new' })).toEqual(copy2)
      expect(update(objectExample, { "data.nestedData.deep": 'new' })).toSatisfy((newValue) => newValue.tuple === objectExample.tuple)

      const copy3: typeof objectExample = JSON.parse(JSON.stringify(objectExample))
      copy3.data.arrayExample[0].name = 'new'
      expect(update(objectExample, { "data.arrayExample.0.name": 'new' })).toEqual(copy3)
      expect(update(objectExample, { "data.nestedData.deep": 'new' })).toSatisfy((newValue) => newValue.tuple === objectExample.tuple)

      const copy4: typeof objectExample = JSON.parse(JSON.stringify(objectExample))
      copy4.data.arrayExample = [...copy4.data.arrayExample, { name: 'example 3' }]

      expect(update(objectExample, { "data.arrayExample": (v) => [...v, { name: 'example 3' }] })).toEqual(copy4)
      expect(update(objectExample, { "data.nestedData": v => v.deep })).toSatisfy((newValue) => newValue.tuple === objectExample.tuple)

   })

})