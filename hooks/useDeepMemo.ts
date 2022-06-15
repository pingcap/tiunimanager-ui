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

import { DependencyList, useMemo, useRef } from 'react'
import { plainDeepEqual } from '../src/utils/equals'

export default function useDeepMemo<T, D extends DependencyList>(
  defaultValue: () => T,
  deps: D
): T {
  const ref = useRef<D | undefined>(undefined)

  if (!ref.current || !plainDeepEqual(deps, ref.current)) {
    ref.current = deps
  }

  return useMemo(defaultValue, ref.current)
}
