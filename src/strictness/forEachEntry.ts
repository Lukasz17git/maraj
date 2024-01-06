import { ObjectLiteral } from "./(strictness.types)";

type ForEachEntry = <T extends ObjectLiteral>(
   object: T,
   callbackfn: (key: keyof T, value: T[keyof T]) => void
) => void

export const forEachEntry: ForEachEntry = (object, callback) => Object.keys(object).forEach(key => callback(key, object[key]))
