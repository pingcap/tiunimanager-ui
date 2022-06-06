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

import { defineMacro, defineMacroProvider } from 'vite-plugin-macro'

const wrapMacro = defineMacro('wrap')
  .withCustomType(`import { ReactElement, ComponentType } from 'react'`)
  .withSignature(
    `(target: ReactElement, ...wrappers: ComponentType[]): ReactElement`
  )
  .withHandler(({ path, args }, { types, template }, { appendImports }) => {
    const [target, ..._wrappers] = args
    if (!target.isExpression())
      throw new Error(`argument target of wrap() should be identifier/jsx.`)
    const wrappers = _wrappers.map((arg) => {
      if (!arg.isIdentifier())
        throw new Error(`argument wrappers of wrap() should be identifiers.`)
      return arg
    })
    appendImports({
      moduleName: 'react',
      exportName: 'createElement',
      localName: '__createElement',
    })
    const wrap = (wrapped: string) =>
      wrappers.reduce((result, current) => {
        return `__createElement(${current.node.name}, undefined, ${result})`
      }, wrapped)

    if (target.isIdentifier() && /^[A-Z]/.test(target.node.name)) {
      path.replaceWith(
        template.expression.ast(
          wrap(`/* @__PURE__ */ __createElement(${target.node.name})`)
        )
      )
    } else {
      const tempID = path.scope.generateUid('component')
      path
        .findParent((p) => p.isStatement())!
        .insertBefore(
          types.variableDeclaration('const', [
            types.variableDeclarator(types.identifier(tempID), target.node),
          ])
        )
      path.replaceWith(template.expression.ast(wrap(tempID)))
    }
  })

export function provideComponents() {
  return defineMacroProvider({
    id: 'm:components',
    exports: {
      '@components-macro': {
        macros: [wrapMacro],
      },
    },
  })
}
