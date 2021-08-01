import useStorage from '@hooks/useStorage'

export default function useLocalStorage<T>(key: string, initialValue: T) {
  return useStorage(key, initialValue, window.localStorage)
}
