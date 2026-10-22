import { it, describe, expect } from 'vitest'
import * as maraj from './index'

describe("index test", () => {

   it('should export every runtime function', () => {
      expect(Object.keys(maraj).sort()).toEqual([
         'experimental_extendableUpdate',
         'forEachEntry',
         'isObjectLiteral',
         'isStringIndex',
         'parseStringIndex',
         'remove',
         's',
         'select',
         'set',
         'splitPathAtLastKey',
         'strict',
         'strictType',
         'update',
      ])
      Object.values(maraj).forEach((value) => expect(value).toBeTypeOf('function'))
   })

})
