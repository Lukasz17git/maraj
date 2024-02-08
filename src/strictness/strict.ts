import { DotPaths } from "../immutable/(immutable.types)";
import { Strict } from "./(strictness.types)";


/** Adds strict property to an object literal */
type StrictFn = <T>(value: T) => Strict<T>
export const strict: StrictFn = <T>(value: T) => value as Strict<T>
export const s = strict

/** Checks the strictness of a type passed to a function or callback without 3rd party implementation */
type StrictType = <T extends U, U>(v: T extends U ? DotPaths<T> extends DotPaths<U> ? T : Exclude<DotPaths<T>, DotPaths<U>> : never) => U
export const strictType: StrictType = (v) => v

//ensureStrictness
//strictTypeWrapper
//checkStrictness
//strictTypeChecker
//addTypeStrictness
//garanteeStrictness