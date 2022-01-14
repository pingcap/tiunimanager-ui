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
