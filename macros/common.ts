import { dirname, relative, resolve, sep } from 'path'
import glob from 'fast-glob'

export function searchByGlob(pattern: string, baseDir: string) {
  return glob.sync(pattern, {
    cwd: baseDir,
    ignore: ['**/node_modules/**'],
  })
}

// make block become an expression
export function $do<T>(block: () => T): T {
  return block()
}

export function joinUrlPath(...item: string[]) {
  return item
    .join('/')
    .replace(/\/{2,}/g, '/')
    .replace(/(.)\/$/, '$1')
}

interface TreeLike<T> {
  children: T[]
}

export function flatten<T extends TreeLike<T>>(origin: T): T[]
export function flatten<T extends TreeLike<T>>(origin: T[]): T[]
export function flatten<T extends TreeLike<T>>(origin: T | T[]): T[] {
  const result: T[] = []
  function collect(o: T) {
    result.push(o)
    o.children.forEach(collect)
  }
  if (Array.isArray(origin)) origin.forEach(collect)
  else collect(origin)
  return result
}

export function escapeGlob(pattern: string): string {
  return glob.escapePath(pattern)
}

export function genPathBasedId(root: string, cwd: string) {
  return relative(root, cwd).split(sep).join('|')
}

export function capitalize(s: string) {
  if (!s) return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function normalizePathPattern(
  pattern: string,
  importer: string,
  root: string
) {
  if (!pattern.startsWith('.') && !pattern.startsWith('/')) {
    throw new Error(
      `pattern must start with '.' or '/' (relative to project root)`
    )
  }
  let base: string
  let parentDepth = 0
  const isAbsolute = pattern.startsWith('/')
  if (isAbsolute) {
    base = resolve(root)
    pattern = pattern.slice(1)
  } else {
    base = dirname(importer)
    while (pattern.startsWith('../')) {
      pattern = pattern.slice(3)
      base = resolve(base, '../')
      parentDepth++
    }
    if (pattern.startsWith('./')) {
      pattern = pattern.slice(2)
    }
  }
  return {
    normalized: pattern,
    base,
    resolveImportPath: isAbsolute
      ? (f: string) => `/${f}`
      : parentDepth
      ? (f: string) => `${'../'.repeat(parentDepth)}${f}`
      : (f: string) => `./${f}`,
  }
}
