import { Dispatch, SetStateAction, useState } from 'react'

export function useStateWithDefault<T>(
  defaultValue: T
): [T, Dispatch<SetStateAction<T>>, () => void] {
  const [value, set] = useState(defaultValue)
  const setDefault = () => set(defaultValue)
  return [value, set, setDefault]
}
