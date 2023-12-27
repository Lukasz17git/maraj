import { LiteralIndex } from "./utilities/updateImmutably";

type Example = { 'name.xd.blue': string, 'name.xd.green': string, 'lastname': string, 'oo': number, "files.0": number, "files.1.name": string, "files.1.lastname": string }
type Example2 = { 'name.1': string, 'name.0': number }

type Index = LiteralIndex | number | `${number}` | `${number}.${string}`

type FirstLevelKeys<T> = {
   [Key in keyof T & string]: Key extends `${infer K}.${string}` ? K : Key
}[keyof T & string]

type NestedKeys<T, K extends string | number> = {
   [Key in keyof T]: Key extends `${K}.${infer U}` ? U : never
}[keyof T]

type FirstLevelObject<T extends Record<string, any>> =
   keyof T extends LiteralIndex | number | `${number}` ? Array<T[keyof T]>
   : keyof T extends `${number}.${infer U}` ? Array<{ [Key2 in U]: T[keyof T] }>
   : {
      [Key1 in FirstLevelKeys<T>]: Key1 extends keyof T ? T[Key1] : FirstLevelObject<{ [Key2 in NestedKeys<T, Key1>]: T[`${Key1}.${Key2}`] }>
   } & unknown


type Test2 = FirstLevelObject<Example>



