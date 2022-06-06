/*
 * Copyright 2022 PingCAP, Inc.
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

import { randomUUID } from 'crypto'
import { basename, join } from 'path'
import { lstatSync, readdirSync } from 'fs'
import { $do, escapeGlob, genPathBasedId, joinUrlPath } from '../common'
import { normalizePathPattern } from '../common'

export interface Resource {
  importPath: string
  importID: string
  sync: boolean
}

export interface PageNode {
  // path-based id
  id: string
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
    // hide sub-pages when parents traverse pages to get menu items, defaults to false
    protect: boolean
  }
  imports: {
    // meta.tsx?, e.g. ../a/meta.tsx
    metaFile?: Resource
    // undefined means no component for this route
    indexComponent?: Resource
    // undefined means this page is standalone (not a wrapper for children)
    layoutComponent?: Resource
    // glob to load translations file
    translations?: string
  }
}

export type LoadPagesOptions = {
  pagesPath: string
  routePrefix: string
  projectRoot: string
  filepath: string

  allowNoMeta: boolean

  cb?: (p: PageNode) => void
}

export function loadPages({
  pagesPath,
  routePrefix,
  projectRoot,
  filepath,
  allowNoMeta,
  cb,
}: LoadPagesOptions) {
  const { normalized, base, resolveImportPath } = normalizePathPattern(
    pagesPath,
    filepath,
    projectRoot
  )

  const pathPrefixLength = normalized.length
  const removePathPrefix = (p: string) => p.slice(pathPrefixLength)

  function traverse(dir: string): PageNode {
    const rawName = basename(dir)
    const dirPath = join(base, dir)
    const cleanPath = dir
      .replace(/(\d])_/g, '$1:') // [0]_param => [0]:param
      .replace(/\[.*?]/g, '')
    const children = readdirSync(dirPath)
    const page: PageNode = {
      id: genPathBasedId(projectRoot, dirPath),
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
        protect: /\[protect]/.test(rawName),
      },
      imports: {
        metaFile: $do(() => {
          // XXX: all in typescript so only test meta.tsx
          const child = children.find((c) =>
            /^meta\.tsx?$/.test(c.toLowerCase())
          )
          if (!child) {
            if (allowNoMeta) return undefined
            else throw new Error(`no meta.ts(x) found in ${dirPath}`)
          }
          const importPath = resolveImportPath(joinUrlPath(dir, child))
          return {
            importPath,
            importID: shortUUID(importPath),
            sync: false,
          }
        }),
        indexComponent: $do(() => {
          // XXX: components should be defined in typescript so only test index.tsx
          const child = children.find((c) =>
            /^index(\.sync)?\.tsx$/.test(c.toLowerCase())
          )
          if (!child) return undefined
          const sync = child.toLowerCase().endsWith('sync.tsx')
          const importPath = resolveImportPath(joinUrlPath(dir, child))
          return {
            importPath,
            importID: shortUUID(importPath),
            sync,
          }
        }),
        layoutComponent: $do(() => {
          // XXX: components should be defined in typescript so only test layout.tsx
          const child = children.find((c) =>
            /^layouts?(\.sync)?\.tsx$/.test(c.toLowerCase())
          )
          if (!child) return undefined
          const sync = child.toLowerCase().endsWith('sync.tsx')
          const importPath = resolveImportPath(joinUrlPath(dir, child))
          return {
            importPath,
            importID: shortUUID(importPath),
            sync,
          }
        }),
        translations: $do(() => {
          const child = children.find((c) =>
            /^translations?$/.test(c.toLowerCase())
          )
          if (!child) return undefined
          return resolveImportPath(
            joinUrlPath(escapeGlob(joinUrlPath(dir, child)), '*.{yaml,yml}')
          )
        }),
      },
    }
    if (!page.children.length && !page.imports.indexComponent)
      throw new Error(
        `${resolveImportPath(
          dir
        )} is a leaf-node page but no index component found`
      )
    cb && cb(page)
    return page
  }

  return traverse(normalized)
}

// fs path to short uuid
const fsPathToId: Map<string, string> = new Map()

function shortUUID(fsPath: string) {
  let id = fsPathToId.get(fsPath)
  if (!id) fsPathToId.set(fsPath, (id = '_' + randomUUID().slice(0, 8)))
  return id
}
