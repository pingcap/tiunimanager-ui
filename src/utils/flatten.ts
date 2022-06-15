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

export function flattenChildren<T extends { children?: Array<R> }, R = T>(
  items: T[]
): (T | R)[] {
  const result: (T | R)[] = [...items]
  let temp: (T | R)[] = items
  while (temp.length) {
    const buf = []
    for (const t of temp) {
      if ((t as any).children?.length) buf.push(...(t as any).children)
    }
    temp = buf
    result.push(...buf)
  }
  return result
}
