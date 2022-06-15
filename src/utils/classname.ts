/*
 * Copyright 2022 PingCAP
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

import { isArray, isPlainObject, isString } from '@/utils/types'

export type ClassNameCandidate =
  | boolean
  | string
  | { [name: string]: boolean }
  | ClassNameCandidate[]

export default function classNames(...candidates: ClassNameCandidate[]) {
  const result: string[] = []

  for (const c of candidates) {
    if (!c) continue
    if (isString(c)) result.push(c)
    else if (isArray(c)) result.push(classNames(...c))
    else if (isPlainObject(c))
      Object.keys(c).forEach((n) => c[n] && result.push(n))
  }

  return result.join(' ')
}
