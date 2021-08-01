import { useState } from 'react'

function revert(v: boolean) {
  return !v
}

export default function useToggle(
  defaultValue: boolean
): [boolean, (value?: boolean) => void] {
  const [state, setState] = useState(defaultValue)
  return [
    state,
    (v) => {
      if (v === undefined) setState(revert)
      else setState(v)
    },
  ]
}
