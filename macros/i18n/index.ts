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
import {
  $do,
  genPathBasedId,
  normalizePathPattern,
  searchByGlob,
} from '../common'
import { randomUUID } from 'crypto'

type I18nImportMeta = {
  importID: string
  importPath: string
  lang: string
}

export interface I18nOptions {
  languageWhitelist?: Set<string>
  globalNamespaces?: Set<string>
  defaultLoadGlob?: string
}

const helperModuleName = '@i18n-macro-helper'

export function provideI18n({
  languageWhitelist,
  globalNamespaces,
  defaultLoadGlob,
}: I18nOptions = {}) {
  const ids: Set<string> = new Set()

  const getNS =
    globalNamespaces && globalNamespaces.size
      ? (id: string) =>
          `[${[id, ...globalNamespaces.values()]
            .map((n) => `'${n}'`)
            .join(', ')}]`
      : (id: string) => `'${id}'`

  const filter: (meta: I18nImportMeta) => unknown = languageWhitelist
    ? (i) => i.lang && languageWhitelist.has(i.lang)
    : (i) => i.lang

  const loadMacro = defineMacro('loadI18n')
    .withSignature(
      '(glob?: string): void',
      'load i18n resources by glob pattern.'
    )
    .withHandler(
      (
        { path, args, filepath, projectPath },
        { template },
        { appendImports }
      ) => {
        const { pattern, cwd } = $do(() => {
          if (args.length === 0) {
            if (!defaultLoadGlob) {
              throw new Error(`neither glob argument nor defaultLoadGlob found`)
            }
            return { pattern: defaultLoadGlob, cwd: filepath }
          }

          const pattern = $do(() => {
            const temp = args[0]
            if (!temp.isStringLiteral())
              throw new Error(`glob should be string literal in load()`)
            return temp.node.value
          })

          const cwd = $do(() => {
            if (args.length < 2) return filepath
            const temp = args[1]
            if (!temp.isStringLiteral())
              throw new Error(`cwd should be string literal in load()`)
            return temp.node.value
          })
          return { pattern, cwd }
        })

        const id = genPathBasedId(projectPath[0], cwd)

        const yamls = $do(() => {
          const { normalized, base, resolveImportPath } = normalizePathPattern(
            pattern,
            filepath,
            projectPath[0]
          )
          return searchByGlob(normalized, base)
            .map((i): I18nImportMeta => {
              const importPath = resolveImportPath(i)
              return {
                importID: '_' + randomUUID().slice(0, 8),
                importPath,
                lang: importPath.match(/\/([^/]+?)\.ya?ml/)?.[1] || '',
              }
            })
            .filter(filter)
        })

        appendImports([
          {
            defaultName: '__i18next',
            moduleName: 'i18next',
          },
          {
            exportName: 'onI18nInitialized',
            localName: '__onI18nInitialized',
            moduleName: helperModuleName,
          },
          ...yamls.map((i) => ({
            defaultName: i.importID,
            moduleName: i.importPath,
          })),
        ])

        path.replaceWith(
          template.expression.ast(`
    __onI18nInitialized(() => {
    ${yamls
      .map(
        (i) =>
          `__i18next.addResourceBundle('${i.lang}', '${id}', ${i.importID}, true, false)`
      )
      .join('\n')}
    })`)
        )

        ids.add(id)
      }
    )

  const loadWithNSMacro = defineMacro('loadI18nWithNS')
    .withSignature(
      '(ns: string, glob?: string): void',
      'load i18n resources by glob pattern.'
    )
    .withHandler(
      (
        { path, args, filepath, projectPath },
        { template },
        { appendImports }
      ) => {
        if (args.length === 0) throw new Error(`missing parameters`)
        const ns = $do(() => {
          const temp = args[0]
          if (!temp.isStringLiteral())
            throw new Error(`namespace should be string literal`)
          return temp.node.value
        })

        const pattern = $do(() => {
          if (!args[1]) {
            if (!defaultLoadGlob) {
              throw new Error(`neither glob argument nor defaultLoadGlob found`)
            }
            return defaultLoadGlob
          }
          const temp = args[1]
          if (!temp.isStringLiteral())
            throw new Error(`glob should be string literal in load()`)
          return temp.node.value
        })

        const yamls = $do(() => {
          const { normalized, base, resolveImportPath } = normalizePathPattern(
            pattern,
            filepath,
            projectPath[0]
          )
          return searchByGlob(normalized, base)
            .map((i): I18nImportMeta => {
              const importPath = resolveImportPath(i)
              return {
                importID: '_' + randomUUID().slice(0, 8),
                importPath,
                lang: importPath.match(/\/([^/]+?)\.ya?ml/)?.[1] || '',
              }
            })
            .filter(filter)
        })

        appendImports([
          {
            defaultName: '__i18next',
            moduleName: 'i18next',
          },
          {
            exportName: 'onI18nInitialized',
            localName: '__onI18nInitialized',
            moduleName: helperModuleName,
          },
          ...yamls.map((i) => ({
            defaultName: i.importID,
            moduleName: i.importPath,
          })),
        ])

        path.replaceWith(
          template.expression.ast(`
    __onI18nInitialized(() => {
    ${yamls
      .map(
        (i) =>
          `__i18next.addResourceBundle('${i.lang}', '${ns}', ${i.importID}, true, false)`
      )
      .join('\n')}
    })`)
        )
      }
    )

  const useMacro = defineMacro('useI18n')
    .withCustomType(`import { UseTranslationResponse } from 'react-i18next'`)
    .withSignature(
      `(): UseTranslationResponse<''>`,
      'a wrapper of useTranslation(), with auto namespace management.'
    )
    .withHandler(
      ({ path, filepath, projectPath }, { template }, { appendImports }) => {
        appendImports({
          exportName: 'useTranslation',
          localName: '__useTranslation',
          moduleName: 'react-i18next',
        })
        const id = getTheMostMatchedId(
          ids,
          genPathBasedId(projectPath[0], filepath)
        )
        const ns = getNS(id)
        path.replaceWith(template.expression.ast(`__useTranslation(${ns})`))
      }
    )

  const getMacro = defineMacro('getI18n')
    .withCustomType(`import { TFunction } from 'i18next'`)
    .withSignature(
      `(): TFunction`,
      'a wrapper of i18next.t(), with auto namespace management.'
    )
    .withHandler(
      ({ path, filepath, projectPath }, { template }, { appendImports }) => {
        appendImports({
          exportName: 'withNamespace',
          localName: '__withNamespace',
          moduleName: helperModuleName,
        })
        const id = getTheMostMatchedId(
          ids,
          genPathBasedId(projectPath[0], filepath)
        )
        const ns = getNS(id)
        path.replaceWith(template.expression.ast(`__withNamespace(${ns})`))
      }
    )

  const resolveMacro = defineMacro('resolveNamespace')
    .withSignature(`(): string`, 'get the i18n namespace for the current file.')
    .withHandler(({ path, filepath, projectPath }, { types }) => {
      const id = getTheMostMatchedId(
        ids,
        genPathBasedId(projectPath[0], filepath)
      )
      const ns = getNS(id)
      path.replaceWith(types.stringLiteral(ns))
    })

  return defineMacroProvider({
    id: 'm:i18n',
    exports: {
      '@i18n-macro': {
        macros: [loadMacro, loadWithNSMacro, useMacro, getMacro, resolveMacro],
      },
      [helperModuleName]: {
        code: `
import i18next from 'i18next'
export const onI18nInitialized = /*#__PURE__*/ (hook) => {
  if (i18next.isInitialized) hook()
  else i18next.on('initialized', hook)
}
export const withNamespace = /*#__PURE__*/ (ns) => 
  (key, opt) => 
    opt === undefined 
      ? i18next.t(key, { ns })
      : typeof opt === 'string'
        ? i18next.t(key, { defaultValue: opt, ns })
        : i18next.t(key, { ns, ...opt })

`,
        types: `
  import { TFunction } from 'i18next'  
  export function onI18nInitialized(hook: () => void): void;
  export function withNamespace(ns: string | string[]): TFunction;
        `,
      },
    },
  })
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
