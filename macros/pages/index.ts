/*
 * Copyright 2022 PingCAP
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { $do, flatten, joinUrlPath } from '../common'
import { dirname, normalize, resolve, sep } from 'path'
import { defineMacro, defineMacroProvider } from 'vite-plugin-macro'
import { loadPages } from './pages'
import { parseRoutes, renderRoutes } from './routes'
import { parseMenus, renderMenus } from './menus'

export interface PagesOptions {
  allowNoMeta?: boolean
}

const macroModuleName = '@pages-macro'
const pagesTagName = 'pages'

export function providePages({ allowNoMeta = false }: PagesOptions = {}) {
  const dirPathToRoutePath: Map<string, string> = new Map()

  // loadRoutes also load the root page
  const loadRoutesMacro = defineMacro('loadRoutes')
    .withCustomType(
      `
import { ComponentType } from 'react'
export interface IRoute<T> {
  id: string
  defaultName: string
  path: string
  exact: boolean
  sync: boolean
  component: ComponentType<any>
  meta: ${allowNoMeta ? 'T | undefined' : 'T'}
  children: IRoute<T>[]
}`
    )
    .withSignature(
      `<T>(pagesPath: string, prefix?: string): IRoute<T>`,
      'get routes tree by the path of the root directory of pages and the prefix of target routes.'
    )
    .withHandler(
      (
        { path, args, projectPath, filepath, modules, watcher },
        { template },
        { appendImports, prependToBody }
      ) => {
        const pagesPath = $do(() => {
          if (args.length === 0)
            throw new Error(`pagesPath should not be undefined in loadRoutes()`)
          const temp = args[0]
          if (!temp.isStringLiteral())
            throw new Error(
              `pagesPath should be string literal in loadRoutes()`
            )
          return temp.node.value
        })

        const routePrefix = $do(() => {
          if (args.length < 2) return '/'
          const temp = args[1]
          if (!temp.isStringLiteral())
            throw new Error(
              `prefix should be string literal or left unset in loadRoutes()`
            )
          return temp.node.value
        })

        const pagesTree = loadPages({
          pagesPath,
          routePrefix,
          projectRoot: projectPath[0],
          filepath,
          allowNoMeta,
          cb: (p) => dirPathToRoutePath.set(p.dirPath, p.route.full),
        })

        const routes = parseRoutes(pagesTree)
        const flattenRoutes = flatten(routes)

        // load components
        appendImports([
          {
            localName: '__Fragment',
            exportName: 'Fragment',
            moduleName: 'react',
          },
          {
            localName: '__createElement',
            exportName: 'createElement',
            moduleName: 'react',
          },
          { localName: '__lazy', exportName: 'lazy', moduleName: 'react' },
          {
            localName: '__loadI18n',
            exportName: 'loadI18n',
            moduleName: '@i18n-macro',
          },
          ...flattenRoutes
            .filter((r) => r.metaFile)
            .map((r) => ({
              defaultName: r.metaFile!.importID,
              moduleName: r.metaFile!.importPath,
            })),
          ...flattenRoutes
            .filter((r) => r.indexComponent && r.indexComponent.sync)
            .map((r) => ({
              defaultName: r.indexComponent!.importID,
              moduleName: r.indexComponent!.importPath,
            })),
          ...flattenRoutes
            .filter((r) => r.layoutComponent && r.layoutComponent.sync)
            .map((r) => ({
              defaultName: r.layoutComponent!.importID,
              moduleName: r.layoutComponent!.importPath,
            })),
        ])

        // load i18n
        prependToBody(
          template.statements.ast(
            flattenRoutes
              .filter((r) => r.translations)
              .map(
                (r) =>
                  `__loadI18n(${JSON.stringify(
                    r.translations
                  )}, ${JSON.stringify(r.dir)})`
              )
              .join('\n')
          )
        )

        // for dev only
        const pagesDir = resolve(dirname(filepath), pagesPath)
        watcher?.add(pagesDir)
        modules?.setTag(filepath, pagesTagName)

        path.replaceWith(template.expression.ast(renderRoutes(routes)))
      }
    )

  // loadMenus only load sub-pages as menu items
  const loadMenusMacro = defineMacro('loadMenus')
    .withCustomType(
      `
export interface IMenuItem<T> {
  id: string
  defaultName: string
  path: string
  meta: ${allowNoMeta ? 'T | undefined' : 'T'}
  children: IMenuItem<T>[]
}`
    )
    .withSignature(
      `<T>(pagesPath: string, prefix?: string): IMenuItem<T>[]`,
      `get menu tree by the path of the root directory of pages and the route prefix of these menus.
if prefix is left unset, the route of the current file will be used as the route prefix of the menus.`
    )
    .withHandler(
      (
        { path, args, filepath, projectPath, modules, watcher },
        { template },
        { appendImports }
      ) => {
        const pagesPath = $do(() => {
          if (args.length === 0)
            throw new Error(`pagesPath should not be undefined in loadMenus()`)
          const temp = args[0]
          if (!temp.isStringLiteral())
            throw new Error(`pagesPath should be string literal in loadMenus()`)
          return temp.node.value
        })

        const routePrefix = $do(() => {
          if (args.length < 2) {
            const temp = dirPathToRoutePath.get(normalize(dirname(filepath)))
            if (!temp)
              throw new Error(
                `prefix should be specified in loadMenus() because ${filepath} is not in parsed routes`
              )
            return temp
          }
          const temp = args[1]
          if (!temp.isStringLiteral())
            throw new Error(
              `prefix should be string literal or left blank in loadMenus()`
            )
          return temp.node.value
        })

        const pagesTree = loadPages({
          pagesPath,
          routePrefix,
          projectRoot: projectPath[0],
          filepath,
          allowNoMeta,
          cb: (p) => dirPathToRoutePath.set(p.dirPath, p.route.full),
        })

        const menus = parseMenus(pagesTree)
        const flattenMenus = flatten(menus)

        // load menu items
        appendImports(
          flattenMenus
            .filter((m) => m.metaFile)
            .map((m) => ({
              defaultName: m.metaFile!.importID,
              moduleName: m.metaFile!.importPath,
            }))
        )

        // for dev only
        const pagesDir = resolve(dirname(filepath), pagesPath)
        watcher?.add(pagesDir)
        modules?.setTag(filepath, pagesTagName)

        path.replaceWith(template.expression.ast(renderMenus(menus)))
      }
    )

  function getTheMostMatchedRoute(toBeMatched: string) {
    const dirs = toBeMatched.split(sep)
    const depth = dirs.length
    for (let i = depth; i > 0; i--) {
      const dirPath = dirs.slice(0, i).join(sep)
      const routePath = dirPathToRoutePath.get(dirPath)
      if (routePath) return routePath
    }
    return
  }

  const resolveRouteMacro = defineMacro('resolveRoute')
    .withSignature(
      `(relativePath?: string, ...params: string[]): string`,
      `get the route path by relative path.
if relativePath is left unset, returns the route path of current file.`
    )
    .withHandler(({ path, args, filepath }, { template, types }) => {
      const relativePath = $do(() => {
        if (args.length === 0) return '.'
        const temp = args[0]
        if (!temp.isStringLiteral())
          throw new Error(
            `relativePath should be string literal in resolveRoute()`
          )
        return temp.node.value
      })

      const thisPath = getTheMostMatchedRoute(normalize(dirname(filepath)))
      if (thisPath === undefined)
        throw new Error(
          `page that is not in parsed route tree cannot call resolveRoute()`
        )

      const normalizedPath = normalize(joinUrlPath(thisPath, relativePath))
        .split(sep)
        .join('/')

      if (args.length < 2) {
        path.replaceWith(
          template.expression.ast(JSON.stringify(normalizedPath))
        )
        return
      }

      const params = normalizedPath
        .split('/')
        .slice(1)
        .filter((p) => p.startsWith(':'))

      if (params.length === 0)
        throw new Error(`the route ${normalizedPath} doesn't contains params`)

      path.replaceWith(
        types.templateLiteral(
          normalizedPath.split(/:[^/]+/).map((s) =>
            types.templateElement({
              raw: s,
              cooked: s,
            })
          ),
          params.map((p, i) => {
            const arg = args[i + 1]
            if (!arg.isExpression())
              throw new Error(
                `value for params '${p}' should be identifier or string`
              )
            return arg.node
          })
        )
      )
    })

  return defineMacroProvider((env) => ({
    id: 'm:pages',
    exports: {
      [macroModuleName]: {
        macros: [loadRoutesMacro, loadMenusMacro, resolveRouteMacro],
      },
    },
    hooks: {
      onStart() {
        if (env.dev) {
          // update cache so can have only existed routes
          env.watcher?.on('unlinkDir', (path) => {
            dirPathToRoutePath.delete(path)
          })

          env.watcher?.on('all', (ev, path) => {
            switch (ev) {
              case 'add':
              case 'unlink': {
                if (/meta\.tsx?$/.test(path) || /[iI]ndex\.tsx?$/.test(path))
                  env.modules?.invalidateByTag(pagesTagName)
                break
              }
              case 'addDir':
              case 'unlinkDir':
                if (/translations?/.test(path))
                  env.modules?.invalidateByTag(pagesTagName)
            }
          })
        }
      },
    },
  }))
}
