import { ObjectLiteral } from "../../../src/strictness/(strictness.types)"


/** Checks if any provided value is an object literal or not */
type IsObjectLiteral = (valueToTest: unknown) => valueToTest is ObjectLiteral
export const isObjectLiteral: IsObjectLiteral = (valueToTest: unknown): valueToTest is ObjectLiteral => !!valueToTest && Object.getPrototypeOf(valueToTest) === Object.prototype
