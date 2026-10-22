

type ParseStringIndex = (stringKey: string) => number | null
export const parseStringIndex: ParseStringIndex = (stringKey: string) => {
   const parsedInt = parseInt(stringKey)
   const areEqual = parsedInt.toString() === stringKey
   return areEqual ? parsedInt : null
}

type IsStringIndex = (stringKey: string) => stringKey is `${number}`
export const isStringIndex: IsStringIndex = (stringKey: string): stringKey is `${number}` => parseInt(stringKey).toString() === stringKey
