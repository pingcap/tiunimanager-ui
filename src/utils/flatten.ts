export function flattenChildren<T extends { children?: Array<R> }, R = T>(
  items: T[]
): (T | R)[] {
  const result: (T | R)[] = [...items]
  let temp: (T | R)[] = items
  while (temp.length) {
    const buf = []
    for (const t of temp) {
      if ((t as any).children?.length) buf.push(...(t as any).children)
    }
    temp = buf
    result.push(...buf)
  }
  return result
}
