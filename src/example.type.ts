import { DotPaths, UpdateObject } from "./types"

const exampleSymbol = Symbol()
const exampleSymbol2 = Symbol()
export type Example = {
   a: string,
   b: { b1: string },
   c: { c1: number[] }
   d: { d1: ['xd', 'hi'] }
   e: { e1: ({ name: string })[] }
   1: 'blue'
   [exampleSymbol]: string
   [exampleSymbol2]: { a: { a1: string } }

}


type Paths = DotPaths<[string, string]>

type UpdateObj = UpdateObject<Example>