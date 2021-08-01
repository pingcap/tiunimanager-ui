import useStorage from '@hooks/useStorage'

export default function useSessionStorage<T>(key: string, initialValue: T) {
  return useStorage(key, initialValue, window.sessionStorage)
}
