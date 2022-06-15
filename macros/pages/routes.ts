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

import { capitalize } from '../common'
import { PageNode, Resource } from './pages'

export interface Route {
  id: string

  // PageNode['route']['full']
  path: string
  // PageNode['route']['endpoint']
  endpoint: string

  // PageNode['dirPath']
  dir: string

  isMenuItem: boolean

  protect: boolean

  // show only when exactly matched, defaults to true for leaf-node pages,
  // see https://reactrouter.com/web/api/Route/exact-bool
  exact: boolean

  metaFile?: Resource
  indexComponent?: Resource
  layoutComponent?: Resource
  translations?: string

  children: Route[]
}

function createRoute(node: PageNode, override?: Partial<Route>): Route {
  return {
    id: node.id,
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

export function parseRoutes(pages: PageNode): Route {
  function traverse(page: PageNode) {
    const routes: Route[] = []
    if (!pages.children.length) return routes

    const route = createRoute(page, {
      exact: true,
      // only keep index component and meta
      translations: undefined,
      layoutComponent: undefined,
    })
    routes.push(route)

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

export function renderRoutes(route: Route): string {
  // TODO: support sync component
  return `{
  id: '${route.id}',
  defaultName: '${capitalize(route.endpoint)}',
  path: '${route.path}',
  exact: ${route.exact},
  sync: ${
    route.exact
      ? route.indexComponent?.sync ?? true
      : route.layoutComponent?.sync ?? true
  },
  component: ${
    route.exact
      ? route.indexComponent
        ? route.indexComponent.sync
          ? route.indexComponent.importID
          : `__lazy(() => import('${route.indexComponent.importPath}'))`
        : `() => /*#__PURE__*/__createElement(__Fragment, null, 'NOT IMPLEMENTED YET')`
      : route.layoutComponent
      ? route.layoutComponent.sync
        ? route.layoutComponent.importID
        : `__lazy(() => import('${route.layoutComponent.importPath}'))`
      : `({children}) => /*#__PURE__*/__createElement(__Fragment, null, children)`
  },
  meta: ${route.metaFile ? route.metaFile.importID : 'undefined'},
  children: [
  ${route.children.map(renderRoutes).join(',\n')}
  ],
}`
}
