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

export function readonly<T extends object>(o: T): T {
  return new Proxy(o, {
    get(target, p, receiver): any {
      return Reflect.get(target, p, receiver)
    },
  })
}

export function mapObj<O, K extends string, V>(
  o: O,
  mapper: (value: O[keyof O], key: keyof O) => { key: K; value: V }
): Record<K, V> {
  const result = {} as Record<K, V>
  const keys = Object.keys(o) as Array<keyof O>
  keys.forEach((k) => {
    const { key, value } = mapper(o[k], k)
    result[key] = value
  })
  return result
}

export function getKeyByValue<O>(o: O, value: O[keyof O]): undefined | keyof O {
  const keys = Object.keys(o) as Array<keyof O>
  for (const key of keys) {
    if (o[key] === value) return key
  }
}
