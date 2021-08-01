export function readonly<T extends object>(o: T): T {
  return new Proxy(o, {
    get(target, p, receiver): any {
      return Reflect.get(target, p, receiver)
    },
  })
}
