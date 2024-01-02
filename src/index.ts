export { remove } from './utilities/remove'
export { select } from './utilities/select'
export { splitPathAtLastKey } from './utilities/splitPathAtLastKey'
export { set } from './utilities/set'
export { update, experimental_extendableUpdate } from './utilities/immutableImplementation'
export { isObjectLiteral } from './utilities/isObjectLiteral'
export { isStringIndex, parseStringIndex } from './utilities/stringIndex'
export { unsealStrictCallback } from './utilities/strictCallback'
export type { StrictCallback } from './utilities/strictCallback'
export type { LiteralIndex } from './utilities/immutableImplementation'
export type { ObjectLiteral } from './utilities/isObjectLiteral'
export type {
   KeyOf,
   DotPaths,
   ValueInPath,
   ReturnedValueInPath,
   UpdateObject,
   UpdateValue,
} from './types/types'