declare const emptyObjectSymbol: unique symbol;
type EmptyObject = { [emptyObjectSymbol]?: never };
type IsNever<T> = [T] extends [never] ? true : false;
type IsAny<T> = 0 extends 1 & T ? true : false;
type UnknownArray = readonly unknown[];

type ToString<T> = T extends string | number ? `${T}` : never;
type Primitive =
   | null
   | undefined
   | string
   | number
   | boolean
   | symbol
   | bigint;

type BuiltIns = Primitive | void | Date | RegExp;
type NonRecursiveType = BuiltIns | Function | (new (...args: any[]) => unknown);
type VariablePartOfArray<T extends UnknownArray> =
   T extends unknown
   ? T extends readonly [...StaticPartOfArray<T>, ...infer U]
   ? U
   : []
   : never; // Should never happen

type StaticPartOfArray<T extends UnknownArray, Result extends UnknownArray = []> =
   T extends unknown
   ? number extends T['length'] ?
   T extends readonly [infer U, ...infer V]
   ? StaticPartOfArray<V, [...Result, U]>
   : Result
   : T
   : never; // Should never happen


type InternalPaths<_T, T = Required<_T>> =
   T extends EmptyObject | readonly []
   ? never
   : {
      [Key in keyof T]:
      Key extends string | number // Limit `Key` to string or number.
      // If `Key` is a number, return `Key | `${Key}``, because both `array[0]` and `array['0']` work.
      ?
      | Key
      | ToString<Key>
      | (
         IsNever<Paths<T[Key]>> extends false
         ? `${Key}.${Paths<T[Key]>}`
         : never
      )
      : never
   }[keyof T & (T extends UnknownArray ? number : unknown)];



type Paths<T> =
   T extends NonRecursiveType | ReadonlyMap<unknown, unknown> | ReadonlySet<unknown>
   ? never
   : IsAny<T> extends true
   ? never
   : T extends UnknownArray
   ? number extends T['length']
   // We need to handle the fixed and non-fixed index part of the array separately.
   ? InternalPaths<StaticPartOfArray<T>>
   | InternalPaths<Array<VariablePartOfArray<T>[number]>>
   : InternalPaths<T>
   : T extends object
   ? InternalPaths<T>
   : never;
