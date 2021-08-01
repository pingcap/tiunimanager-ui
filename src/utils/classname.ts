import { isArray, isPlainObject, isString } from '@/utils/types'

export type ClassNameCandidate =
  | boolean
  | string
  | { [name: string]: boolean }
  | ClassNameCandidate[]

export default function classNames(...candidates: ClassNameCandidate[]) {
  const result: string[] = []

  for (const c of candidates) {
    if (!c) continue
    if (isString(c)) result.push(c)
    else if (isArray(c)) result.push(classNames(...c))
    else if (isPlainObject(c))
      Object.keys(c).forEach((n) => c[n] && result.push(n))
  }

  return result.join(' ')
}
