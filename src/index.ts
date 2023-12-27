export { remove } from './utilities/remove'
export { select } from './utilities/select'
export { splitPathAtLastKey } from './utilities/splitPathAtLastKey'
export { set } from './utilities/set'
export { immutableUpdate, autoExpandableImmutableUpdate } from './utilities/updateImmutably'
export { isObjectLiteral } from './utilities/isObjectLiteral'
export { isStringIndex, parseStringIndex } from './utilities/stringIndex'
export type {
   DotPaths,
   ValueInDotPath,
   ReturnedValueInDotPath,
   DotPathUpdateObject,
   DotPathUpdateValue,
   OptionalKeys,
   RequiredKeys,
   PrimitivesAndNativeObjects,
} from './types'