
const example = { a: 'hey', b: 1, c: null }

function getVal<TState, TKey extends keyof TState>(state: TState, key: TKey): TState[TKey]
function getVal<TState>(): <TKey extends keyof TState>(state: TState, key: TKey) => TState[TKey]
function getVal<TState, TKey extends keyof TState>() {
   if (arguments.length === 0) return <TKey extends keyof TState>(state: TState, key: TKey) => state[key]
   const state: TState = arguments[0]
   const key: TKey = arguments[1]
   return state[key]
}

const value1 = getVal(example, 'a')
//    ^?
console.log('value1:', value1)
const value2 = getVal<typeof example>()(example, 'b')
//    ^?
console.log('value2:', value2)

type Infer = unknown

type Builder = <
   TConstraintA extends PropertyKey[] = PropertyKey[],
   TConstraintB = unknown,
   TConstraintC = unknown
>() => <
   TA extends TConstraintA,
   TB extends TConstraintB & keyof TA,
   TC extends TConstraintC,
>(
   a: TA,
   b: TB,
   c: TC
) => [TA, TB, TC]

const aa: Builder = () => (a, b, c) => [a, b, c]

const key = 'c' as const
const result = aa()([1, 2, 3], 'copyWithin', 1)
//    ^?

type GetVal = <TState, TKey extends keyof TState>(state: TState, key: TKey) => TState[TKey]

type GetValBuilder = <
   TStateConstraint = unknown,
   TKeyConstraint = unknown
>() => <
   TState extends TStateConstraint,
   TKey extends keyof TState & TKeyConstraint
>(state: TState, key: TKey) => TState[TKey]

const getValBuilder: GetValBuilder = () => (state, key) => state[key]

const res = getValBuilder<Infer, string>()({ a: 'val_a', 1: 'val_1' }, 'a')
//    ^?