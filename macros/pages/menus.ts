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

export interface Menu {
  id: string
  // PageNode['route']['full']
  path: string
  // PageNode['route']['endpoint']
  endpoint: string

  // PageNode['dirPath']
  dir: string

  metaFile?: Resource

  children: Menu[]
}

export function parseMenus(pages: PageNode) {
  function traverse(page: PageNode) {
    const menus: Menu[] = []
    const hasMenuItems = page.children.filter((c) => c.meta.index > 0)
    hasMenuItems
      .sort((a, b) => a.meta.index - b.meta.index)
      .forEach((p) => {
        const menu = {
          id: p.id,
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

export function renderMenus(menus: Menu[]): string {
  return `[${menus
    .map(
      (menu) => `{
   id: '${menu.id}',
   defaultName: '${capitalize(menu.endpoint)}',
   path: '${menu.path}',
   meta: ${menu.metaFile ? menu.metaFile.importID : 'undefined'},
   children: ${renderMenus(menu.children)},
 }`
    )
    .join(',\n')}]`
}
