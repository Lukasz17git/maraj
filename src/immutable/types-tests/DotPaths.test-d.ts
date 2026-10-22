import { it, describe, expectTypeOf } from 'vitest'
import { DotPaths } from '../(immutable.types)'
import { ExtendedArrayIndexes as Index } from '../../strictness/(strictness.types)'

/**
 * --------------------------------------------
 *  OBJECTS
 * --------------------------------------------
 */

/** 1 to 3 props per level. */
type Depth1 = { id: number, name: string, active: boolean }
type Depth1DotPaths = DotPaths<Depth1>

type Depth2 = {
   user: { name: string, email: string }
   createdAt: Date
}
type Depth2DotPaths = DotPaths<Depth2>

type Depth3 = {
   settings: {
      theme: { mode: 'dark' | 'light', accent: string }
      locale: string
   }
   version: number
   flags: { beta: boolean }
}
type Depth3DotPaths = DotPaths<Depth3>

type Depth4 = {
   order: {
      customer: {
         address: { street: string, city: string, zip: string }
      }
      total: number
   }
   deletedAt: Date | null
}
type Depth4DotPaths = DotPaths<Depth4>

type Depth5 = {
   a: {
      b: {
         c: {
            d: { e: string }
            f: number
         }
      }
      g: boolean
   }
   h: { i: string, j: string }
   k: bigint
}
type Depth5DotPaths = DotPaths<Depth5>

type Depth6 = {
   name: string
   hq: {
      address: {
         street: string
         geo: {
            lat: number
            lng: number
            precision: {
               meters: number
               source: { provider: string, updatedAt: Date }
            }
         }
      }
      phone: string
   }
   ceo: { name: string } | null
}
type Depth6DotPaths = DotPaths<Depth6>

type NativeObjects = { avatar: File, attachment: Blob, uploads: FileList, createdAt: Date }
type NativeObjectsDotPaths = DotPaths<NativeObjects>


/**
 * --------------------------------------------
 *  OBJECTS WITH ARRAYS
 * --------------------------------------------
 */

type PrimitiveArrays = { tags: string[], scores: readonly number[], dates: Date[] }
type PrimitiveArraysDotPaths = DotPaths<PrimitiveArrays>

type ObjectArray = { items: { id: number, name: string }[] }
type ObjectArrayDotPaths = DotPaths<ObjectArray>

type NestedArrays = { matrix: number[][], groups: { users: { name: string }[] }[] }
type NestedArraysDotPaths = DotPaths<NestedArrays>

type Tuples = { point: [number, number], entry: readonly [string, { value: boolean }] }
type TuplesDotPaths = DotPaths<Tuples>

type MixedArray = { values: (string | { label: string })[] }
type MixedArrayDotPaths = DotPaths<MixedArray>

type RootArray = { id: number, children: { id: number }[] }[]
type RootArrayDotPaths = DotPaths<RootArray>

type ArraysDepth6 = {
   orders: {
      id: string
      lines: {
         product: {
            sku: string
            variants: { size: string, stock: number[] }[]
         }
         quantity: number
      }[]
   }[]
   archived: boolean
}
type ArraysDepth6DotPaths = DotPaths<ArraysDepth6>


/**
 * --------------------------------------------
 *  FULL TREES
 * --------------------------------------------
 */

/** Level 2 -> 'a2' | 'b2' | 'c2', so a path mixing levels ('a1.b3') can't match. */
type LevelKeys<TLevel extends number> = `a${TLevel}` | `b${TLevel}` | `c${TLevel}`

/** 3 props per level and string leaves (depth 2 -> { a1: { a2, b2, c2 }, b1: {...}, c1: {...} }). */
type FullTree<TDepth extends number, TLevel extends unknown[] = [unknown]> =
   TLevel['length'] extends TDepth
   ? { [Key in LevelKeys<TLevel['length']>]: string }
   : { [Key in LevelKeys<TLevel['length']>]: FullTree<TDepth, [...TLevel, unknown]> }

/** Joins each level's keys ('a1.b2.c3') instead of walking the object like DotPaths does. */
type FullTreePaths<TDepth extends number, TLevel extends unknown[] = [unknown]> =
   TLevel['length'] extends TDepth
   ? LevelKeys<TLevel['length']>
   : LevelKeys<TLevel['length']> | `${LevelKeys<TLevel['length']>}.${FullTreePaths<TDepth, [...TLevel, unknown]>}`

type FullTree1DotPaths = DotPaths<FullTree<1>>
type FullTree2DotPaths = DotPaths<FullTree<2>>
type FullTree3DotPaths = DotPaths<FullTree<3>>
type FullTree4DotPaths = DotPaths<FullTree<4>>
type FullTree5DotPaths = DotPaths<FullTree<5>>
type FullTree6DotPaths = DotPaths<FullTree<6>>


describe("DotPaths test", () => {

   it('should list every path of objects 1 to 6 levels deep', () => {
      expectTypeOf<Depth1DotPaths>().toEqualTypeOf<'id' | 'name' | 'active'>()
      expectTypeOf<Depth2DotPaths>().toEqualTypeOf<'user' | 'user.name' | 'user.email' | 'createdAt'>()
      expectTypeOf<Depth3DotPaths>().toEqualTypeOf<
         | 'settings'
         | 'settings.theme'
         | 'settings.theme.mode'
         | 'settings.theme.accent'
         | 'settings.locale'
         | 'version'
         | 'flags'
         | 'flags.beta'
      >()
      expectTypeOf<Depth4DotPaths>().toEqualTypeOf<
         | 'order'
         | 'order.customer'
         | 'order.customer.address'
         | 'order.customer.address.street'
         | 'order.customer.address.city'
         | 'order.customer.address.zip'
         | 'order.total'
         | 'deletedAt'
      >()
      expectTypeOf<Depth5DotPaths>().toEqualTypeOf<
         | 'a'
         | 'a.b'
         | 'a.b.c'
         | 'a.b.c.d'
         | 'a.b.c.d.e'
         | 'a.b.c.f'
         | 'a.g'
         | 'h'
         | 'h.i'
         | 'h.j'
         | 'k'
      >()
      expectTypeOf<Depth6DotPaths>().toEqualTypeOf<
         | 'name'
         | 'hq'
         | 'hq.address'
         | 'hq.address.street'
         | 'hq.address.geo'
         | 'hq.address.geo.lat'
         | 'hq.address.geo.lng'
         | 'hq.address.geo.precision'
         | 'hq.address.geo.precision.meters'
         | 'hq.address.geo.precision.source'
         | 'hq.address.geo.precision.source.provider'
         | 'hq.address.geo.precision.source.updatedAt'
         | 'hq.phone'
         | 'ceo'
         | 'ceo.name'
      >()
   })

   it('should not go inside Files, Blobs, FileLists or Dates', () => {
      expectTypeOf<NativeObjectsDotPaths>().toEqualTypeOf<'avatar' | 'attachment' | 'uploads' | 'createdAt'>()
   })

   it('should add an index after arrays of primitives, Dates and objects', () => {
      expectTypeOf<PrimitiveArraysDotPaths>().toEqualTypeOf<
         | 'tags' | `tags.${Index}`
         | 'scores' | `scores.${Index}`
         | 'dates' | `dates.${Index}`
      >()
      expectTypeOf<ObjectArrayDotPaths>().toEqualTypeOf<
         'items' | `items.${Index}` | `items.${Index}.id` | `items.${Index}.name`
      >()
      expectTypeOf<MixedArrayDotPaths>().toEqualTypeOf<'values' | `values.${Index}` | `values.${Index}.label`>()
   })

   it('should add an index for each level of nested arrays', () => {
      expectTypeOf<NestedArraysDotPaths>().toEqualTypeOf<
         | 'matrix'
         | `matrix.${Index}`
         | `matrix.${Index}.${Index}`
         | 'groups'
         | `groups.${Index}`
         | `groups.${Index}.users`
         | `groups.${Index}.users.${Index}`
         | `groups.${Index}.users.${Index}.name`
      >()
      expectTypeOf<ArraysDepth6DotPaths>().toEqualTypeOf<
         | 'orders'
         | `orders.${Index}`
         | `orders.${Index}.id`
         | `orders.${Index}.lines`
         | `orders.${Index}.lines.${Index}`
         | `orders.${Index}.lines.${Index}.product`
         | `orders.${Index}.lines.${Index}.product.sku`
         | `orders.${Index}.lines.${Index}.product.variants`
         | `orders.${Index}.lines.${Index}.product.variants.${Index}`
         | `orders.${Index}.lines.${Index}.product.variants.${Index}.size`
         | `orders.${Index}.lines.${Index}.product.variants.${Index}.stock`
         | `orders.${Index}.lines.${Index}.product.variants.${Index}.stock.${Index}`
         | `orders.${Index}.lines.${Index}.quantity`
         | 'archived'
      >()
   })

   it('should add only the positions a tuple has (point.0, point.1)', () => {
      expectTypeOf<TuplesDotPaths>().toEqualTypeOf<
         | 'point' | 'point.0' | 'point.1'
         | 'entry' | 'entry.0' | 'entry.1' | 'entry.1.value'
      >()
   })

   it('should start every path with an index when the root is an array', () => {
      expectTypeOf<RootArrayDotPaths>().toEqualTypeOf<
         | Index
         | `${Index}.id`
         | `${Index}.children`
         | `${Index}.children.${Index}`
         | `${Index}.children.${Index}.id`
      >()
   })

   it('should list every path of trees with 3 props per level, up to 1092 paths at depth 6', () => {
      expectTypeOf<FullTreePaths<2>>().toEqualTypeOf<
         | 'a1' | 'a1.a2' | 'a1.b2' | 'a1.c2'
         | 'b1' | 'b1.a2' | 'b1.b2' | 'b1.c2'
         | 'c1' | 'c1.a2' | 'c1.b2' | 'c1.c2'
      >()
      expectTypeOf<FullTree1DotPaths>().toEqualTypeOf<FullTreePaths<1>>()
      expectTypeOf<FullTree2DotPaths>().toEqualTypeOf<FullTreePaths<2>>()
      expectTypeOf<FullTree3DotPaths>().toEqualTypeOf<FullTreePaths<3>>()
      expectTypeOf<FullTree4DotPaths>().toEqualTypeOf<FullTreePaths<4>>()
      expectTypeOf<FullTree5DotPaths>().toEqualTypeOf<FullTreePaths<5>>()
      expectTypeOf<FullTree6DotPaths>().toEqualTypeOf<FullTreePaths<6>>()
   })

   it('should accept real paths and reject made-up ones', () => {
      expectTypeOf<'orders.0.lines.2.product.variants.1.stock.3'>().toExtend<ArraysDepth6DotPaths>()
      expectTypeOf<'orders.0.lines.1.product'>().toExtend<ArraysDepth6DotPaths>()
      expectTypeOf<'orders.${number}.lines.${number}.product.sku'>().toExtend<ArraysDepth6DotPaths>()
      expectTypeOf<'a1.b2'>().toExtend<FullTree6DotPaths>()
      expectTypeOf<'a1.b2.c3.a4.b5.c6'>().toExtend<FullTree6DotPaths>()

      expectTypeOf<'orders.lines'>().not.toExtend<ArraysDepth6DotPaths>()
      expectTypeOf<'orders.x.id'>().not.toExtend<ArraysDepth6DotPaths>()
      expectTypeOf<'orders.0.lines.product'>().not.toExtend<ArraysDepth6DotPaths>()
      expectTypeOf<'archived.0'>().not.toExtend<ArraysDepth6DotPaths>()
      expectTypeOf<'a1.b3'>().not.toExtend<FullTree6DotPaths>()
      expectTypeOf<'a1.b2.c3.a4.b5.c6.a7'>().not.toExtend<FullTree6DotPaths>()
   })

   it('should not match a list with a missing or extra path', () => {
      expectTypeOf<Depth6DotPaths>().not.toEqualTypeOf<Exclude<Depth6DotPaths, 'hq.address.geo.lng'>>()
      expectTypeOf<Depth6DotPaths>().not.toEqualTypeOf<Depth6DotPaths | 'hq.fax'>()
      expectTypeOf<Depth5DotPaths>().not.toEqualTypeOf<Depth4DotPaths>()
      expectTypeOf<NestedArraysDotPaths>().not.toEqualTypeOf<Exclude<NestedArraysDotPaths, `matrix.${Index}.${Index}`>>()
      expectTypeOf<RootArrayDotPaths>().not.toEqualTypeOf<Exclude<RootArrayDotPaths, `${Index}.children.${Index}`>>()
      expectTypeOf<ObjectArrayDotPaths>().not.toEqualTypeOf<'items' | `items.${Index}.id` | `items.${Index}.name`>()
      expectTypeOf<TuplesDotPaths>().not.toEqualTypeOf<TuplesDotPaths | 'point.2'>()
      expectTypeOf<FullTree6DotPaths>().not.toEqualTypeOf<FullTreePaths<5>>()
      expectTypeOf<FullTree6DotPaths>().not.toEqualTypeOf<Exclude<FullTree6DotPaths, 'c1.c2.c3.c4.c5.c6'>>()
   })
})
