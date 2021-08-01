import { Plugin } from 'vite'
import { randomUUID } from 'crypto'
import { render } from 'mustache'
import {
  $do,
  capitalize,
  escapeGlob,
  flatten,
  genPathBasedId,
  getProjectRoot,
  joinUrlPath,
  normalizeImportPattern,
  tryImport,
} from '../utils'
import { lstatSync, readdirSync } from 'fs'
import { readFile, writeFile } from 'fs/promises'
import { basename, dirname, join, resolve } from 'path'
import { createMacroPlugin, defineMacro } from '@ulab/create-vite-macro-plugin'
import { NodePath } from '@babel/traverse'
import { Program } from '@babel/types'

const root = getProjectRoot()

export default function vitePluginImportPagesMacro(): Plugin {
  // XXX: so one page should not be included by two apps
  const fsPathToRoutePath: Map<string, string> = new Map()

  // importRoutes also import the root page
  const importRoutesMacro = defineMacro(
    `<T>(pagesPath: string, prefix?: string): IRoute<T>`,
    function importRoutes(
      { path, args, filepath },
      { traverse, template, types }
    ) {
      const pagesPath = $do(() => {
        if (args.length === 0)
          throw new Error(
            `pagesPath should not be undefined in importRoutes() around ${path.getSource()}`
          )
        const temp = args[0]
        if (!types.isStringLiteral(temp))
          throw new Error(
            `pagesPath should be string literal in importRoutes() around ${path.getSource()}`
          )
        return temp.value
      })

      const prefix = $do(() => {
        if (args.length < 2) return '/'
        const temp = args[1]
        if (!types.isStringLiteral(temp))
          throw new Error(
            `prefix should be string literal or left blank in importRoutes() around ${path.getSource()}`
          )
        return temp.value
      })

      const pagesTree = getPages(pagesPath, filepath, root, prefix)
      const routes = genRoutes(pagesTree)
      const flattenRoutes = flatten(routes)

      const prog = path.findParent((p) => p.isProgram()) as NodePath<Program>
      tryImport(traverse, types, template, prog, [
        {
          localName: '__Fragment',
          originName: 'Fragment',
          sourceName: 'react',
        },
        {
          localName: '__createElement',
          originName: 'createElement',
          sourceName: 'react',
        },
        { localName: '__lazy', originName: 'lazy', sourceName: 'react' },
        { localName: '__load', originName: 'load', sourceName: '@i18n-macro' },
        ...flattenRoutes
          .filter((r) => r.metaFile)
          .map((r) => ({ localName: r.importID, sourceName: r.metaFile! })),
      ])

      // inject load-translations statements
      prog.unshiftContainer(
        'body',
        template.statements.ast(
          flattenRoutes
            .filter((r) => r.translations)
            .map(
              (r) =>
                `__load(${JSON.stringify(r.translations)}, ${JSON.stringify(
                  r.dir
                )})`
            )
            .join('\n')
        )
      )

      path.replaceWith(template.expression.ast(renderRoutes(routes)))

      generateRoutesDts([...fsPathToRoutePath.values()]).then()
    }
  )

  // importMenus only import sub-pages as menu items
  const importMenusMacro = defineMacro(
    `<T>(pagesPath: string, prefix?: string): IMenuItem<T>[]`,
    function importMenus(
      { path, args, filepath },
      { traverse, template, types }
    ) {
      const pagesPath = $do(() => {
        if (args.length === 0)
          throw new Error(
            `pagesPath should not be undefined in importMenus() around ${path.getSource()}`
          )
        const temp = args[0]
        if (!types.isStringLiteral(temp))
          throw new Error(
            `pagesPath should be string literal in importMenus() around ${path.getSource()}`
          )
        return temp.value
      })

      const prefix = $do(() => {
        if (args.length < 2) {
          const temp = fsPathToRoutePath.get(dirname(filepath))
          if (!temp)
            throw new Error(
              `prefix should be specified in importMenus() because ${filepath} is not in parsed routes`
            )
          return temp
        }
        const temp = args[1]
        if (!types.isStringLiteral(temp))
          throw new Error(
            `prefix should be string literal or left blank in importMenus() around ${path.getSource()}`
          )
        return temp.value
      })

      const pagesTree = getPages(pagesPath, filepath, root, prefix)
      const menus = genMenus(pagesTree)
      const flattenMenus = flatten(menus)

      const prog = path.findParent((p) => p.isProgram()) as NodePath<Program>
      tryImport(
        traverse,
        types,
        template,
        prog,
        flattenMenus
          .filter((m) => m.metaFile)
          .map((m) => ({ localName: m.importID, sourceName: m.metaFile! }))
      )

      path.replaceWith(template.expression.ast(renderMenus(menus)))
    }
  )

  const {
    invalidateCache,
    configureServer: cs,
    ...rest
  } = createMacroPlugin({
    name: 'plugin-import-pages-macro',
    namespace: '@import-pages-macro',
    // they are defined here but used at the bottom of this file
    typeDefinitions: `
import { ComponentType } from 'react'
export interface IRoute<T> {
  id: string
  defaultName: string
  path: string
  exact: boolean
  sync: boolean
  component: ComponentType<any>
  meta: T
  children: IRoute<T>[]
}

export interface IMenuItem<T> {
  id: string
  defaultName: string
  path: string
  meta: T
  children: IMenuItem<T>[]
}
    `,
    macros: [importRoutesMacro, importMenusMacro],
    dtsPath: './types/import-pages-macro.d.ts',
    parserPlugins: ['topLevelAwait'],
  })

  return {
    ...rest,
    configureServer(server) {
      cs(server)
      // update cache so routes.d.ts can have only existed routes
      server.watcher.on('unlinkDir', (path) => {
        fsPathToRoutePath.delete(path)
      })

      server.watcher.on('all', (ev, path) => {
        switch (ev) {
          case 'add':
          case 'unlink':
            if (/meta\.tsx?$/.test(path) || /[iI]ndex\.tsx?$/.test(path))
              invalidateCache()
            break
          case 'addDir':
          case 'unlinkDir':
            if (/translations?/.test(path)) invalidateCache()
        }
      })
    },
  }

  // get files relative path from glob pattern
  function getPages(
    pagesPath: string,
    importer: string,
    root: string,
    routePrefix: string
  ) {
    const {
      pattern: normalizedPagesPath,
      base,
      resolver,
    } = normalizeImportPattern(pagesPath, importer, root)

    const pathPrefixLength = normalizedPagesPath.length
    const removePathPrefix = (p: string) => p.slice(pathPrefixLength)

    function traverse(dir: string): PageNode {
      const rawName = basename(dir)
      const dirPath = join(base, dir)
      const cleanPath = dir
        .replaceAll(/(\d])_/g, '$1:') // [0]_param => [0]:param
        .replaceAll(/\[.*?]/g, '')
      const children = readdirSync(dirPath)
      const page = {
        rawName,
        dirPath,
        children: children
          .map((f) => {
            const temp = join(dirPath, f)
            // Note: only directories in form [x]xxx can be pages
            if (lstatSync(temp).isDirectory() && /\[.*?]/.test(f))
              return traverse(joinUrlPath(dir, f))
          })
          .filter(
            (r): r is PageNode => r !== undefined && !Number.isNaN(r.meta.index)
          ),
        route: {
          endpoint: basename(cleanPath),
          full: joinUrlPath(routePrefix, removePathPrefix(cleanPath)),
        },
        meta: {
          index: $do(() => {
            const rawIdx = rawName.match(/\[([-+]?\d+?)]/)
            if (!rawIdx) return NaN
            return Number.parseInt(rawIdx[1])
          }),
          sync: /\[sync]/.test(rawName),
          protect: /\[protect]/.test(rawName),
        },
        imports: {
          metaFile: $do(() => {
            // XXX: all in typescript so only test meta.tsx
            const child = children.find((c) => /^meta.tsx?$/.test(c))
            if (!child) throw new Error(`no meta.ts(x) found in ${dirPath}`)
            return resolver(joinUrlPath(dir, child))
          }),
          indexComponent: $do(() => {
            // XXX: components should be defined in typescript so only test index.tsx
            const child = children.find((c) => c.toLowerCase() === 'index.tsx')
            if (!child) return undefined
            return resolver(joinUrlPath(dir, child))
          }),
          translations: $do(() => {
            // XXX: all in typescript so only test index.tsx
            const child = children.find((c) =>
              /^translations?$/.test(c.toLowerCase())
            )
            if (!child) return undefined
            return resolver(
              joinUrlPath(escapeGlob(dir), escapeGlob(child), '*.{yaml,yml}')
            )
          }),
        },
      }
      if (!page.children.length && !page.imports.indexComponent)
        throw new Error(
          `${resolver(dir)} is a leaf-node page but no index component found`
        )
      // Note: add to cache
      fsPathToRoutePath.set(page.dirPath, page.route.full)
      return page
    }

    return traverse(normalizedPagesPath)
  }
}

interface PageNode {
  children: PageNode[]
  // raw dir name, e.g, [-2]notfound
  rawName: string
  // path on file system, e.g. /home/i/Workspace/.../...
  dirPath: string

  route: {
    // route endpoint, e.g, 'world' of 'hello/world'
    endpoint: string
    // full route include prefix, e.g, hello/world
    full: string
  }
  meta: {
    // index, e.g, index is -2 in '[-2]notfound'
    // 0 means fallback
    // positive number means the order of routes and menu from small to big
    // negative number means the order of routes from big to small, and no menu item
    // NaN means not a page, which no need to set manually
    index: number
    // sync load component, default to false
    sync: boolean
    // hide sub-pages when parents traverse pages to get menu items, defaults to false
    protect: boolean
  }
  imports: {
    // path of meta.tsx? in import statements, e.g. ../a/meta.tsx
    metaFile: string
    // undefined means no component for this route
    indexComponent?: string
    // glob to load translations file
    translations?: string
  }
}

interface Route {
  id: string
  importID: string
  // PageNode['route']['full']
  path: string
  // PageNode['route']['endpoint']
  endpoint: string

  // PageNode['dirPath']
  dir: string

  isMenuItem: boolean

  // PageNode['meta']
  sync: boolean
  protect: boolean

  // show only when exactly matched, defaults to true for leaf-node pages,
  // see https://reactrouter.com/web/api/Route/exact-bool
  exact: boolean

  metaFile: string
  indexComponent?: string
  translations?: string

  children: Route[]
}

function createRoute(node: PageNode, override?: Partial<Route>): Route {
  return {
    id: genPathBasedId(root, node.dirPath),
    importID: shortUUID(node.dirPath),
    path: node.route.full,
    endpoint: node.route.endpoint,
    dir: node.dirPath,
    isMenuItem: false,
    ...node.meta,
    ...node.imports,
    exact: node.children.length === 0,
    children: [] as Route[],
    ...override,
  }
}

function genRoutes(pages: PageNode): Route {
  function traverse(page: PageNode) {
    const routes: Route[] = []
    {
      const hasMenuItems = page.children.filter((c) => c.meta.index > 0)
      hasMenuItems
        .sort((a, b) => a.meta.index - b.meta.index)
        .forEach((p) => {
          const route = createRoute(p, {
            isMenuItem: true,
          })
          routes.push(route)
          if (p.children.length) route.children = traverse(p)
        })
    }
    {
      const noMenuItems = page.children.filter((c) => c.meta.index < 0)
      noMenuItems.forEach((p) => (p.meta.index = Math.abs(p.meta.index)))
      noMenuItems
        .sort((a, b) => a.meta.index - b.meta.index)
        .forEach((p) => {
          const route = createRoute(p)
          routes.push(route)
          if (p.children.length) route.children = traverse(p)
        })
    }
    {
      const fallback = page.children.find((c) => c.meta.index == 0)
      if (fallback) {
        const route = createRoute(fallback, {
          // XXX: is redirecting better than just displaying fallback?
          path: fallback.route.full.replace(/\/.+?$/, '/*'),
          // Note: fallback should never be exact
          exact: false,
        })
        routes.push(route)
        if (fallback.children.length) route.children = traverse(fallback)
      }
    }
    return routes
  }

  // root
  return createRoute(pages, {
    children: traverse(pages),
  })
}

function renderRoutes(route: Route): string {
  // TODO: support sync component
  return `{
  id: '${route.id}',
  defaultName: '${capitalize(route.endpoint)}',
  path: '${route.path}',
  exact: ${route.exact},
  sync: ${route.sync},
  component: ${
    route.indexComponent
      ? `__lazy(() => import('${route.indexComponent}'))`
      : `({children}) => /*#__PURE__*/__createElement(__Fragment, null, children)`
  },
  meta: ${route.importID},
  children: [
  ${route.children.map(renderRoutes).join(',\n')}
  ],
}`
}

// fs path to short uuid
const fsPathToId: Map<string, string> = new Map()

function shortUUID(fsPath: string) {
  let id = fsPathToId.get(fsPath)
  if (!id) {
    id = '_' + randomUUID().slice(0, 8)
    fsPathToId.set(fsPath, id)
  }
  return id
}

interface Menu {
  id: string
  importID: string
  // PageNode['route']['full']
  path: string
  // PageNode['route']['endpoint']
  endpoint: string

  // PageNode['dirPath']
  dir: string

  metaFile: string

  children: Menu[]
}

function genMenus(pages: PageNode) {
  function traverse(page: PageNode) {
    const menus: Menu[] = []
    const hasMenuItems = page.children.filter((c) => c.meta.index > 0)
    hasMenuItems
      .sort((a, b) => a.meta.index - b.meta.index)
      .forEach((p) => {
        const menu = {
          id: genPathBasedId(root, p.dirPath),
          importID: shortUUID(p.dirPath),
          path: p.route.full,
          endpoint: p.route.endpoint,
          dir: p.dirPath,
          metaFile: p.imports.metaFile,
          children: [] as Menu[],
        }
        menus.push(menu)
        if (p.children.length && !p.meta.protect) menu.children = traverse(p)
      })

    return menus
  }

  return traverse(pages)
}

function renderMenus(menus: Menu[]): string {
  return `[${menus
    .map(
      (menu) => `{
   id: '${menu.id}',
   defaultName: '${capitalize(menu.endpoint)}',
   path: '${menu.path}',
   meta: ${menu.importID},
   children: ${renderMenus(menu.children)},
 }`
    )
    .join(',\n')}]`
}

async function generateRoutesDts(routes: string[]) {
  await writeFile(
    resolve(__dirname, '../../types/routes.d.ts'),
    render(
      (await readFile(resolve(__dirname, './routes.d.ts.tpl'))).toString(),
      { routes }
    )
  )
}
