export { remove } from './immutable/remove'
export { select } from './immutable/select'
export { splitPathAtLastKey } from './immutable/splitPathAtLastKey'
export { set } from './immutable/set'
export { update, experimental_extendableUpdate } from './immutable/immutableImplementation'
export { isObjectLiteral } from './strictness/isObjectLiteral'
export { isStringIndex, parseStringIndex } from './immutable/stringIndex'
export { unsealStrictCallback } from './immutable/strictCallback'
export type { StrictCallback } from './immutable/strictCallback'
export type { ObjectLiteral } from './strictness/isObjectLiteral'
export type {
   DotPaths,
   ValueInPath,
   ReturnedValueInPath,
   UpdateObject,
   UpdateValue,
} from './immutable/(immutable.types)'