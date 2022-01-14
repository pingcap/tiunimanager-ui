import { useCallback, useState } from 'react'

export default function useToggle(
  defaultValue: boolean
): [boolean, (value?: boolean) => void] {
  const [state, setState] = useState(defaultValue)
  const toggle = useCallback((v) => {
    if (v === undefined) setState((old) => !old)
    else setState(v)
  }, [])
  return [state, toggle]
}
