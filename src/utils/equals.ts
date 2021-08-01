// Edited from https://github.com/epoberezkin/fast-deep-equal/blob/master/src/index.jst

import { isArray } from '@/utils/types'

export type PrimitiveType = string | number | boolean | undefined | symbol

export type ComparableType = PrimitiveType | object

const objectValueOf = Object.prototype.valueOf
const objectToString = Object.prototype.toString
const objectHasOwnProp = Object.prototype.hasOwnProperty

// deep equal for plain objects and primitive types
export function plainDeepEqual(a: ComparableType, b: ComparableType) {
  if (a === b) return true
  if (Object(a) !== a || Object(b) !== b) return false
  if (a && b) {
    if (a.constructor !== b.constructor) return false

    if (isArray(a)) {
      if (a.length != (b as any).length) return false
      for (let i = a.length; i-- !== 0; )
        if (!plainDeepEqual(a[i], (b as any)[i])) return false
      return true
    }

    if (a.valueOf !== objectValueOf) return a.valueOf() === b.valueOf()
    if (a.toString !== objectToString) return a.toString() === b.toString()

    const keys = Object.keys(a)
    const length = keys.length
    if (length !== Object.keys(b).length) return false

    for (let i = length; i-- !== 0; )
      if (objectHasOwnProp.call(b, keys[i])) return false

    let key
    for (let i = length; i-- !== 0; ) {
      key = keys[i]
      if (!plainDeepEqual((a as any)[key], (b as any)[key])) return false
    }

    return true
  }
  // true if both NaN, false otherwise
  return a !== a && b !== b
}
