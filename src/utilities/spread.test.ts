//@ts-nocheck
import { it, describe, expect } from 'vitest'
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

const date = new Date()

describe("spread test", () => {

   it('should return same value if the values aint array/object', () => {
      expect(spread(true)).toBe(true)
      expect(spread(1)).toBe(1)
      expect(spread(date)).toBe(date)
      expect(spread(null)).toBe(null)
      expect(spread(undefined)).toBe(undefined)

      expect(spread(true, [1])).toBe(true)
      expect(spread(1, [1])).toBe(1)
      expect(spread(date, [1])).toBe(date)
      expect(spread(null, [1])).toBe(null)
      expect(spread(undefined, [1])).toBe(undefined)
   })

   it('should return same value for arrays and object if the update is wrong', () => {
      expect(spread(objectExample, true)).toBe(objectExample)
      expect(spread(objectExample, 1)).toBe(objectExample)
      expect(spread(objectExample, date)).toBe(objectExample)
      expect(spread(objectExample, null)).toBe(objectExample)
      expect(spread(objectExample, undefined)).toBe(objectExample)

      expect(spread(arrayExample, true)).toBe(arrayExample)
      expect(spread(arrayExample, 1)).toBe(arrayExample)
      expect(spread(arrayExample, date)).toBe(arrayExample)
      expect(spread(arrayExample, null)).toBe(arrayExample)
      expect(spread(arrayExample, undefined)).toBe(arrayExample)
   })

   it('should spread if everything is good', () => {

      expect(spread(objectExample, { update: 'update' })).toEqual({ ...objectExample, ...{ update: 'update' } })
      expect(spread(objectExample, { name: 'new name' })).toEqual({ ...objectExample, ...{ name: 'new name' } })

      expect(spread(arrayExample, ['update'])).toEqual([...arrayExample, 'update'])
      expect(spread(arrayExample, ['update', 1])).toEqual([...arrayExample, ...['update', 1]])

   })
})