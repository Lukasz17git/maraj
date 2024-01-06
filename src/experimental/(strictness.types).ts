/**
 * --------------------------------------------
 *  STRICTNESS IMPLEMENTATION
 * --------------------------------------------
 */

/** Strict key */
// declare const strict: unique symbol
// type StrictKeySymbol = typeof strict

/** Strict and nonStrict object literal */
// export type NonStrictObject = ObjectLiteral & { [strict]?: never }
// export type StrictObject = ObjectLiteral & { [strict]: PropertyKey }


/** UnStrictify */
// export type UnStrict<T extends StrictObject> = { [Key in Exclude<keyof T, StrictKeySymbol>]: T[Key] }

/** Strictify */
// export type Strict<T> = { [strict]: DotPaths<T> } & T

/** Strict Omit */
// export type StrictOmit<
//    TObject extends StrictObject,
//    TKeysToRemove extends (TAllowOnlyExistentKeys extends true ? keyof TObject : (keyof TObject | string & {} | number & {} | symbol & {})) = never,
//    TAllowOnlyExistentKeys extends boolean = true
// > = Strict<{
//    [Key in Exclude<keyof TObject, TKeysToRemove | StrictKeySymbol>]: TObject[Key]
// }>

/** StrictifiedPick */
// export type StrictPick<
//    TObject extends StrictObject,
//    TKeysToPick extends SmartKeyOf<TObject>
// > = Strict<{
//    [Key in TKeysToPick]: TObject[Key];
// }>

/** StrictifiedIntersection */
// export type StrictIntersection<
//    TObject extends StrictObject,
//    TObjectToAdd extends NonStrictObject
// > = Strict<UnStrict<TObject> & TObjectToAdd>

