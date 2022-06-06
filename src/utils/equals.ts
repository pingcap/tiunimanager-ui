/*
 * Copyright 2022 PingCAP, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
