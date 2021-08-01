import type { Plugin } from 'vite'
import { createMacroPlugin, defineMacro } from '@ulab/create-vite-macro-plugin'
import { NodePath } from '@babel/traverse'
import { Program } from '@babel/types'
import {
  $do,
  genPathBasedId,
  getImportedPaths,
  getProjectRoot,
  hasImported,
  tryImport,
} from '../utils'
import { randomUUID } from 'crypto'

export default function vitePluginI18nMacro(): Plugin {
  const root = getProjectRoot()
  const ids: Set<string> = new Set()

  // FIXME: function load() will be renamed to load2 in Node.
  const loadMacro = defineMacro(
    'load',
    '(glob: string, cwd?: string): void',
    function ({ path, args, filepath }, { traverse, template, types }) {
      const pattern = $do(() => {
        if (args.length === 0)
          throw new Error(
            `glob should not be undefined in load() around ${path.getSource()}`
          )
        const temp = args[0]
        if (!types.isStringLiteral(temp))
          throw new Error(
            `glob should be string literal in load() around ${path.getSource()}`
          )
        return temp.value
      })

      const cwd =
        $do(() => {
          if (args.length > 1) {
            const temp = args[1]
            if (!types.isStringLiteral(temp))
              throw new Error(
                `cwd should be string literal in load() around ${path.getSource()}`
              )
            return temp.value
          }
        }) || filepath

      const id = genPathBasedId(root, cwd)

      const imports = getImportedPaths(pattern, filepath, root).map((i) => ({
        id: '_' + randomUUID().slice(0, 8),
        source: i,
      }))

      const prog = path.findParent((p) => p.isProgram()) as NodePath<Program>
      tryImport(traverse, types, template, prog, [
        {
          localName: '__loadTranslations',
          originName: 'loadTranslations',
          sourceName: '@/i18n',
        },
        ...imports.map((i) => ({
          localName: i.id,
          sourceName: i.source,
        })),
      ])

      path.replaceWith(
        template.expression.ast(`
    __loadTranslations({
      ${imports
        .map(
          (i) =>
            `'${i.source.match(/\/([^/]+?)\.ya?ml/)?.[1] || i.source}': ${i.id}`
        )
        .join(',\n')}
    }, '${id}')
  `)
      )

      ids.add(id)
    }
  )

  const useMacro = defineMacro(
    `(): import('react-i18next').UseTranslationResponse<'type placeholder'>`,
    function useI18n({ path, filepath }, { traverse, types, template }) {
      const prog = path.findParent((p) => p.isProgram()) as NodePath<Program>
      if (
        !hasImported(
          traverse,
          types,
          prog.node,
          '__useTranslation',
          'react-i18next'
        )
      ) {
        prog.unshiftContainer(
          'body',
          template.statement.ast`
        import { useTranslation as __useTranslation } from 'react-i18next'
        `
        )
      }
      const id = getTheMostMatchedId(ids, genPathBasedId(root, filepath))
      path.replaceWith(
        template.expression.ast(`
        __useTranslation('${id}')
      `)
      )
    }
  )

  return {
    ...createMacroPlugin({
      name: 'plugin-i18n-macro',
      namespace: '@i18n-macro',
      macros: [loadMacro, useMacro],
      dtsPath: './types/i18n.d.ts',
      parserPlugins: ['topLevelAwait'],
    }),
  }
}

function getTheMostMatchedId(ids: Set<string>, toBeMatched: string) {
  let theMostMatched = ''
  ids.forEach((id) => {
    if (toBeMatched.startsWith(id) && id.length > theMostMatched.length)
      theMostMatched = id
  })
  if (!theMostMatched) throw new Error('use translations before load it!')
  return theMostMatched
}
