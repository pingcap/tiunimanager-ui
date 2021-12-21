export function readonly<T extends object>(o: T): T {
  return new Proxy(o, {
    get(target, p, receiver): any {
      return Reflect.get(target, p, receiver)
    },
  })
}

export function mapObj<O, K extends string, V>(
  o: O,
  mapper: (value: O[keyof O], key: keyof O) => { key: K; value: V }
): Record<K, V> {
  const result = Object.create(null)
  const keys = Object.keys(o) as Array<keyof O>
  keys.forEach((k) => {
    const { key, value } = mapper(o[k], k)
    result[key] = value
  })
  return result
}

export function getKeyByValue<O>(o: O, value: O[keyof O]): undefined | keyof O {
  const keys = Object.keys(o) as Array<keyof O>
  for (const key of keys) {
    if (o[key] === value) return key
  }
}
