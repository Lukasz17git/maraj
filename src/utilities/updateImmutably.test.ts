//@ts-nocheck
import { it, describe, expect } from 'vitest'
import { updateImmutably } from './updateImmutably'

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
   it('should throw', () => {
      expect(true).toBe(true)
   })
})