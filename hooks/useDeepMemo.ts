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
