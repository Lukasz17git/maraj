
export const parseStringIndex = (v: string) => {
   const parsedInt = parseInt(v)
   const areEqual = parsedInt.toString() === v
   return areEqual ? parsedInt : null
}

export const isStringIndex = (v: string) => parseInt(v).toString() === v