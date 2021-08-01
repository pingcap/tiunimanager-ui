import type { Plugin } from 'vite'
import { createMacroPlugin, defineMacro } from '@ulab/create-vite-macro-plugin'
import { NodePath } from '@babel/traverse'
import { Program } from '@babel/types'
import { $do, getImportedPaths, getProjectRoot } from '../utils'

export default function vitePluginImportAssetsMacro(): Plugin {
  const root = getProjectRoot()
  const importMacro = defineMacro(
    '(glob: string): void',
    function importAssets({ path, args, filepath }, { template, types }) {
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

      const imports = getImportedPaths(pattern, filepath, root)

      const prog = path.findParent((p) => p.isProgram()) as NodePath<Program>
      prog.unshiftContainer(
        'body',
        template.statements.ast(imports.map((i) => `import '${i}'`).join('\n'))
      )

      path.remove()
    }
  )

  return {
    ...createMacroPlugin({
      name: 'plugin-import-assets-macro',
      namespace: '@import-assets-macro',
      macros: [importMacro],
      dtsPath: './types/import-assets-macro.d.ts',
      parserPlugins: ['topLevelAwait'],
    }),
  }
}
