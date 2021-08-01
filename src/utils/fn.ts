export function build<T>(builder: () => T): T {
  return builder()
}
