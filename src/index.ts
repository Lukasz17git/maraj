export { remove } from './immutable/remove'
export { select } from './immutable/select'
export { splitPathAtLastKey } from './immutable/splitPathAtLastKey'
export { set } from './immutable/set'
export { update, experimental_extendableUpdate } from './immutable/immutableImplementation'
export type {
   DotPaths,
   ValueInPath,
   ReturnedValueInPath,
   UpdateValue,
   UpdateObject,
} from './immutable/(immutable.types)'

export { forEachEntry } from './strictness/forEachEntry'
export { isObjectLiteral } from './strictness/isObjectLiteral'
export { s, ensureStrictness } from './strictness/strict'
export { isStringIndex, parseStringIndex } from './strictness/stringIndex'
export type {
   PrimitivesAndNativeObjects,
   Tuple,
   LiteralIndex,
   ExtendedArrayIndexes,
   ObjectLiteral,
   Strict,
   KeyOf
} from './strictness/(strictness.types)'