
/** Checks if any provided value is an object literal or not */
export const isObjectLiteral = (valueToTest: any): boolean => !!valueToTest && Object.getPrototypeOf(valueToTest) === Object.prototype