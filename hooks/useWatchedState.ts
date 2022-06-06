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

import { useState } from 'react'

export default function useWatchedState<T>(
  defaultValue: T | (() => T),
  // onChange will be called immediately after the request of changing state,
  // so there is no guarantee that it will be called after re-rendering
  onChange?: (next: T, prev: T) => void
): [T, (value: T) => void] {
  const [innerValue, setInnerValue] = useState<T>(() => {
    if (defaultValue === undefined) return undefined

    return typeof defaultValue === 'function'
      ? (defaultValue as CallableFunction)()
      : defaultValue
  })

  function triggerChange(newValue: T) {
    setInnerValue(newValue)
    // XXX: Just simple comparison for now.
    if (innerValue !== newValue && onChange) {
      onChange(newValue, innerValue)
    }
  }

  return [innerValue, triggerChange]
}
