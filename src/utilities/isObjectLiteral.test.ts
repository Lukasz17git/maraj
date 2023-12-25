// @ts-nocheck

import { it, describe, expect } from 'vitest'
import { isObjectLiteral } from './isObjectLiteral'

describe("isObjectLiteral test", () => {

   it('should return false for non-literal objects', () => {
      expect(isObjectLiteral()).toBe(false)
      expect(isObjectLiteral(null)).toBe(false)
      expect(isObjectLiteral(true)).toBe(false)
      expect(isObjectLiteral(false)).toBe(false)
      expect(isObjectLiteral('')).toBe(false)
      expect(isObjectLiteral('non empty')).toBe(false)
      expect(isObjectLiteral(1)).toBe(false)
      expect(isObjectLiteral(1.123)).toBe(false)
      expect(isObjectLiteral(Date)).toBe(false)
      expect(isObjectLiteral(new Date())).toBe(false)
      expect(isObjectLiteral(File)).toBe(false)
      expect(isObjectLiteral(new File([], ''))).toBe(false)
      expect(isObjectLiteral(new Function())).toBe(false)
      expect(isObjectLiteral([])).toBe(false)
      expect(isObjectLiteral([1])).toBe(false)
      expect(isObjectLiteral([{}])).toBe(false)
      expect(isObjectLiteral(new RegExp(''))).toBe(false);
      expect(isObjectLiteral(new Error())).toBe(false);
      expect(isObjectLiteral(new Number(1))).toBe(false);
      expect(isObjectLiteral(new String('test'))).toBe(false);
      expect(isObjectLiteral(new Boolean(true))).toBe(false);
      expect(isObjectLiteral(new ArrayBuffer(2))).toBe(false);
      expect(isObjectLiteral(new DataView(new ArrayBuffer(2)))).toBe(false);
      expect(isObjectLiteral(new Int8Array())).toBe(false);
      expect(isObjectLiteral(new Uint8Array())).toBe(false);
      expect(isObjectLiteral(new Uint8ClampedArray())).toBe(false);
      expect(isObjectLiteral(new Int16Array())).toBe(false);
      expect(isObjectLiteral(new Uint16Array())).toBe(false);
      expect(isObjectLiteral(new Int32Array())).toBe(false);
      expect(isObjectLiteral(new Uint32Array())).toBe(false);
      expect(isObjectLiteral(new Float32Array())).toBe(false);
      expect(isObjectLiteral(new Float64Array())).toBe(false);
      expect(isObjectLiteral(new BigInt64Array())).toBe(false);
      expect(isObjectLiteral(new BigUint64Array())).toBe(false);
      expect(isObjectLiteral(Symbol())).toBe(false);
      expect(isObjectLiteral(Symbol('desc'))).toBe(false);
      expect(isObjectLiteral(Symbol.iterator)).toBe(false);
      expect(isObjectLiteral(new Set())).toBe(false);
      expect(isObjectLiteral(new Map())).toBe(false);
      expect(isObjectLiteral(new WeakSet())).toBe(false);
      expect(isObjectLiteral(new WeakMap())).toBe(false);
      expect(isObjectLiteral(new Promise(() => { }))).toBe(false);
      expect(isObjectLiteral(async function () { })).toBe(false);
      expect(isObjectLiteral(async () => { })).toBe(false);
      expect(isObjectLiteral(() => { })).toBe(false);
   })
   it('should return true for literal objects', () => {
      expect(isObjectLiteral({})).toBe(true)
      expect(isObjectLiteral({ constructor: {} })).toBe(true)
      expect(isObjectLiteral({ constructor: undefined })).toBe(true)
      expect(isObjectLiteral({ constructor: null })).toBe(true)

      // weird cases that doesn't affect the behaviour
      expect(isObjectLiteral(Math)).toBe(true);
      expect(isObjectLiteral(JSON)).toBe(true);
   })
})