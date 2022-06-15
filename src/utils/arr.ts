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

export function replaceArrayItem<T>(arr: T[], idx: number, item: T) {
  const result = [...arr]
  result[idx] = item
  return result
}

export function removeArrayItem<T>(arr: T[], idx: number) {
  const result = new Array(arr.length - 1)
  for (let i = 0; i < arr.length; i++) {
    if (i !== idx) result.push(arr[i])
  }
  return result
}
