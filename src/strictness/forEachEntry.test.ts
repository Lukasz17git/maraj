import { it, describe, expect } from 'vitest'
import { forEachEntry } from './forEachEntry'

describe("isObjectLiteral test", () => {

   it('should return false for non-literal objects', () => {
      let result = ''
      expect(forEachEntry({ a: '1', b: '2' }, (key, value) => {
         result = result + key
      })).toSatisfy(() => result === 'ab')
   })

   it('should return false for non-literal objects', () => {
      let result = ''
      expect(forEachEntry({ a: '1', b: '2' }, (key, value) => {
         result = result + value
      })).toSatisfy(() => result === '12')
   })

})