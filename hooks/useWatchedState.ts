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
