import { useRef } from 'react'

export default function usePersistFn<T extends (...args: any[]) => any>(fn: T) {
  return useRef(fn).current
}
