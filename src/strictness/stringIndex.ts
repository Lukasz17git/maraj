

type ParseStringIndex = (stringKey: string) => number | null
export const parseStringIndex: ParseStringIndex = (stringKey: string) => {
   const parsedInt = parseInt(stringKey)
   const areEqual = stringKey !== 'NaN' && parsedInt.toString() === stringKey
   return areEqual ? parsedInt : null
}

/* 'NaN' is skipped: parseInt('NaN').toString() is 'NaN' too */
type IsStringIndex = (stringKey: string) => stringKey is `${number}`
export const isStringIndex: IsStringIndex = (stringKey: string): stringKey is `${number}` => stringKey !== 'NaN' && parseInt(stringKey).toString() === stringKey
