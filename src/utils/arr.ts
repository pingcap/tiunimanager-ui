export function replaceArrayItem<T>(arr: T[], idx: number, item: T) {
  const result = [...arr]
  result[idx] = item
  return result
}

export function removeArrayItem<T>(arr: T[], idx: number) {
  const result = new Array(arr.length - 1)
  for (let i = 0; i < arr.length; i++) {
    if (i !== idx) result.push(arr[i])
  }
  return result
}
