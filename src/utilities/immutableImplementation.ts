import { DotPathUpdateObject, ExtendedUpdate } from "../types";
import { isObjectLiteral } from "./isObjectLiteral";
import { isStringIndex } from "./stringIndex";

/** Index literal type to improve DX at managing updates. */
const LITERAL_INDEX = "${number}"
export type LiteralIndex = typeof LITERAL_INDEX

type Tracker = { [K in string]?: Tracker }

type ObjectOrArray = Record<string | number | symbol, any>
type OptionValues = 'error' | 'skip' | 'add'
type Options = { onNewProps?: OptionValues, onNewIndexes?: OptionValues }
type ImmutableImplementation = <T extends ObjectOrArray, U extends DotPathUpdateObject<T>>(state: T, updateObject: U, options?: Options) => T | ExtendedUpdate<T, U>

const toJson = (v: any) => JSON.stringify(v)
const joinKeys = (keys: string[], index?: number) => keys.slice(0, index).join('.')
const isArray = (v: any) => Array.isArray(v)

const immutableImplementation: ImmutableImplementation = (state, updates, options = {}) => {

   /* default options */
   options = { onNewProps: 'add', onNewIndexes: 'error', ...options }

   /* checks state type */
   if (!isObjectLiteral(state) && !Array.isArray(state)) throw new Error(`"${toJson(state)}" is not an literalObject/array`)

   /* checks updates type */
   if (!isObjectLiteral(updates)) throw new Error(`wrong "updates" type provided`)

   //@ts-ignor
   const stateCopy = Array.isArray(state) ? [...state] : { ...state }
   const alreadyShallowCopiedPaths: Tracker = {}

   for (const [pathSeparatedByDots, newValueToUpdate] of Object.entries(updates)) {
      // TODO: Not sure if needed.
      /* continue if path === '' */
      if (!pathSeparatedByDots) continue

      let pathKeysToReachLastKey = pathSeparatedByDots.split(".")
      let lastKeyWhereUpdateHappens = pathKeysToReachLastKey.pop()!

      // /* throw if devs forgot to change LITERAL_INDEX into an actual number */
      // if (pathKeysToReachLastKey.includes(LITERAL_INDEX)) throw new Error(`"${LITERAL_INDEX}" inside "${pathSeparatedByDots}"`)

      let shallowCopiedPathsTracker = alreadyShallowCopiedPaths
      let currentParent: Record<string, any> = stateCopy

      /* shallow copy recursively the path until i reach the object/array containing the "lastKeyWhereUpdateHappens" */
      for (let keyIndexInsidePath = 0; keyIndexInsidePath < pathKeysToReachLastKey.length; keyIndexInsidePath++) {

         const currentKey = pathKeysToReachLastKey[keyIndexInsidePath]! //must be a string

         const valueInCurrentKey = currentParent[currentKey]

         /* checking the type in "valueInCurrentKey" */
         const isCurrentValueAnObject = isObjectLiteral(valueInCurrentKey)
         const isCurrentValueAnArray = isArray(valueInCurrentKey)
         /* It has to be undefined instead of "hasOwnProperty" because i may want to add more nested props
          and there could be a case where the prop exist and is undefined. */
         const isCurrentValueUndefined = valueInCurrentKey === undefined

         if (!isCurrentValueAnObject && !isCurrentValueAnArray && !isCurrentValueUndefined) throw new Error(`Property "${currentKey}" in "${joinKeys(pathKeysToReachLastKey, keyIndexInsidePath)}" is a primitive`)

         /* checking if the current path has been already shallowCopied */
         if (!shallowCopiedPathsTracker[currentKey]) {
            if (isCurrentValueUndefined) {
               //TODO: Maybe add so you can't add new properties to an array?
               const isCurrentKeyAnIndex = isArray(currentParent) && isStringIndex(currentKey)
               const isNextKeyAnIndex = isStringIndex(pathKeysToReachLastKey[keyIndexInsidePath + 1] ?? lastKeyWhereUpdateHappens)
               const optionBehaviour = isCurrentKeyAnIndex ? options.onNewIndexes : options.onNewProps
               if (optionBehaviour === 'error') throw new Error(`${currentKey} doesn't exist in "${joinKeys(pathKeysToReachLastKey, keyIndexInsidePath)}"`)
               if (optionBehaviour === 'skip') continue
               currentParent[currentKey] = isNextKeyAnIndex ? [] : {}
            } else {
               /* shallow copying the current parent IN THE STATECOPY (declared above, because it's a reference) */
               currentParent[currentKey] = isCurrentValueAnArray ? [...valueInCurrentKey] : { ...valueInCurrentKey }
            }
            /* adding the current shallow copied path to the tracker */
            shallowCopiedPathsTracker[currentKey] = {}
         }

         /* setting up the currentParent for the next iteration of currentKey */
         currentParent = currentParent[currentKey]

         /* setting up the tracker for the next iteration of currentKey */
         shallowCopiedPathsTracker = shallowCopiedPathsTracker[currentKey]!
      }

      /* parent (has to always be an object or array), already shallow copied, containing the lastKey where update happens. */
      const parentOfLastKey = currentParent

      /* behaviour on new properties/indexes */
      if (!parentOfLastKey.hasOwnProperty(lastKeyWhereUpdateHappens)) {
         const isCurrentKeyAnIndex = Array.isArray(parentOfLastKey) && isStringIndex(lastKeyWhereUpdateHappens)
         const optionBehaviour = isCurrentKeyAnIndex ? options.onNewIndexes : options.onNewProps
         if (optionBehaviour === 'error') throw new Error(`Property/Index "${lastKeyWhereUpdateHappens}" doesnt exist in the path "${joinKeys([...pathKeysToReachLastKey, lastKeyWhereUpdateHappens])}". Its value is: "${toJson(parentOfLastKey)}"`)
         if (optionBehaviour === 'skip') continue
      }

      /* setting the new value in the given path */
      //@ts-ignore: if prop doesnt exist it will add it only if "addNonExistentPropsAndIndexes" is enabled
      parentOfLastKey[lastKeyWhereUpdateHappens] = typeof newValueToUpdate === 'function' ? newValueToUpdate(parentOfLastKey[lastKeyWhereUpdateHappens]) : newValueToUpdate

      /* Need to delete where update happens in shallowCopiedPathsTracker because there may be a full object/array (lest
       call it "NewObjectValue") set as new value, and after this there may be another new update but inside its properties,
       so i need after it shallow copy it again to prevent updating the original provided "NewObjectValue" */
      delete shallowCopiedPathsTracker[lastKeyWhereUpdateHappens]
   }
   return stateCopy as typeof state | ExtendedUpdate<typeof state, typeof updates>
}


type ImmutableUpdate = <TObject extends ObjectOrArray>(
   state: TObject,
   dotPathUpdateObject: DotPathUpdateObject<TObject>,
   options?: Options
) => TObject

/**
 * Creates a new object applying immutable updates using dot-path syntax. 
 * Can add or skip new props or indexes depending on options. 
 * TYPESCRIPT: Dot-Path Update Object type must STRICTLY match the type of state.
 * @param state Original State Object.
 * @param dotPathUpdateObject Dot Path Update Object.
 * @param options Options to change JS behaviour on non-existent fields.
 * @returns New Updated Object.
 */
//@ts-ignore
export const update: ImmutableUpdate = (state, dotPathUpdateObject, options) => immutableImplementation(state, dotPathUpdateObject, options)


type ExtendableImmutableUpdate = <TObject extends ObjectOrArray, TUpdateObject extends DotPathUpdateObject<TObject>
>(
   state: TObject,
   dotPathUpdateObject: TUpdateObject,
) => ExtendedUpdate<TObject, TUpdateObject>

/**
 * Creates a new object applying immutable updates using dot-path syntax. 
 * It will always add non-existent props or indexes if provided.
 * TYPESCRIPT: Dot-Path Update Object type extends from the type of state and you can add new non-existent properties.
 * @param state Original State Object.
 * @param dotPathUpdateObject Dot Path Update Object.
 * @returns New Updated Object.
 */
//@ts-ignore
export const extendableUpdate: ExtendableImmutableUpdate = (state, dotPathUpdateObject) => immutableImplementation(state, dotPathUpdateObject)