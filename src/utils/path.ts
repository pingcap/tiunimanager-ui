export function join(items: string[], sep = '/') {
  const replace = new RegExp(sep + '{1,}', 'g')
  return items.join(sep).replace(replace, sep)
}
