import { makeLegalIdentifier } from '@rollup/pluginutils'
import { load } from 'js-yaml'
import { PluginOption } from 'vite'
import toSource from './tosource'

const ext = /\.ya?ml$/

export interface YamlOptions {
  filter?: RegExp
  // False means export all entries as default,
  // true means export all entries as default and each top-level entries separately;
  // default to false.
  exportSeparately?: boolean
  transformer?: (raw: any, id: string) => any
}

export default function vitePluginYaml(
  { filter, exportSeparately, transformer }: YamlOptions = {
    exportSeparately: false,
  }
): PluginOption {
  const loader = load

  return {
    name: 'yaml-loader',
    transform(content, id) {
      if (!ext.test(id) || (filter && !filter.test(id))) return null

      let data = loader(content)

      if (transformer) {
        data = transformer(data, id)
      }
      let code = `const data = ${toSource(data)};\n`
      code += `export default data;\n`
      if (typeof data === 'object' && data !== null && exportSeparately) {
        code += Object.keys(data)
          .filter((key) => key === makeLegalIdentifier(key))
          .map((key) => `export const ${key} = data.${key};`)
          .join('\n')
      }
      return {
        code,
        map: { mappings: '' },
      }
    },
  }
}
