declare module '@routes' {
    export type Routes =
      {{#routes}}
          | '{{{.}}}'
      {{/routes}}
          | string
}