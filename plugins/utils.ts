import { dirname, relative, resolve, sep } from 'path'
import glob from 'fast-glob'
import _traverse, { NodePath } from '@babel/traverse'
import _types, { Program } from '@babel/types'
import _template from '@babel/template'
import { existsSync } from 'fs'

function searchByGlob(pattern: string, baseDir: string) {
  return glob.sync(pattern, {
    cwd: baseDir,
    ignore: ['**/node_modules/**'],
  })
}

export function normalizeImportPattern(
  pattern: string,
  importer: string,
  root: string
): { pattern: string; base: string; resolver: (s: string) => string } {
  if (!pattern.startsWith('.') && !pattern.startsWith('/')) {
    throw new Error(
      `pattern must start with "." or "/" (relative to project root)`
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
    pattern,
    base,
    resolver: isAbsolute
      ? (f) => `/${f}`
      : parentDepth
      ? (f) => `${'../'.repeat(parentDepth)}${f}`
      : (f) => `./${f}`,
  }
}

// get files relative path from glob pattern
export function getImportedPaths(
  pattern: string,
  importer: string,
  root: string,
  searcher: (pattern: string, baseDir: string) => string[] = searchByGlob
) {
  const {
    pattern: normalizedPattern,
    base,
    resolver,
  } = normalizeImportPattern(pattern, importer, root)
  const files = searcher(normalizedPattern, base)
  return files.map(resolver)
}

// get project root
export function getProjectRoot() {
  const paths = (require.main?.path || process.cwd()).split(sep)
  let path
  for (let i = 0; i < paths.length; i++) {
    path = paths.slice(0, i + 1).join(sep)
    if (existsSync([path, 'package.json'].join(sep))) return path
  }

  throw new Error('can not find project root')
}

// make block become an expression
export function $do<T>(block: () => T): T {
  return block()
}

export function joinUrlPath(...item: string[]) {
  return item
    .join('/')
    .replaceAll(/\/{2,}/g, '/')
    .replace(/(.)\/$/, '$1')
}

export function hasImported(
  traverse: typeof _traverse,
  types: typeof _types,
  program: Program,
  localName: string,
  sourceName: string
) {
  let has = false
  traverse(program, {
    Declaration(path) {
      if (!path.isImportDeclaration()) return
      if (!(path.node.source.value === sourceName)) return
      path.node.specifiers.forEach((s) => {
        if (types.isImportSpecifier(s)) {
          if (s.local.name === localName) {
            has = true
            path.stop()
          }
        }
      })
    },
  })
  return has
}

export function tryImport(
  traverse: typeof _traverse,
  types: typeof _types,
  template: typeof _template,
  program: NodePath<Program>,
  imports: { localName: string; originName?: string; sourceName: string }[]
) {
  imports.forEach(({ localName, originName, sourceName }) => {
    if (!hasImported(traverse, types, program.node, localName, sourceName)) {
      program.unshiftContainer(
        'body',
        template.statement.ast(
          originName
            ? `import { ${originName} as ${localName} } from '${sourceName}'`
            : `import ${localName} from '${sourceName}'`
        )
      )
    }
  })
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
