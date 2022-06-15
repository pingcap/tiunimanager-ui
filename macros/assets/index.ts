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

import { defineMacro, defineMacroProvider } from 'vite-plugin-macro'
import { $do, normalizePathPattern, searchByGlob } from '../common'

const importMacro = defineMacro('importAssets')
  .withSignature('(glob: string): void', 'import all assets by glob pattern.')
  .withHandler(
    (
      { path, args, filepath, projectPath },
      { template },
      { prependToBody }
    ) => {
      const pattern = $do(() => {
        if (args.length === 0)
          throw new Error(`glob should not be undefined in load()`)
        const temp = args[0]
        if (!temp.isStringLiteral())
          throw new Error(`glob should be string literal in load()`)
        return temp.node.value
      })

      const { normalized, base, resolveImportPath } = normalizePathPattern(
        pattern,
        filepath,
        projectPath[0]
      )

      const assets = searchByGlob(normalized, base).map(resolveImportPath)

      prependToBody(
        template.statements.ast(assets.map((i) => `import '${i}'`).join('\n'))
      )

      path.remove()
    }
  )

export const provideAssets = () => {
  return defineMacroProvider({
    id: 'm:assets',
    exports: {
      '@assets-macro': {
        macros: [importMacro],
      },
    },
  })
}
