declare module '@routes' {
  export type Routes =
    | '/login'
    | '/notfound'
    | '/dashboard'
    | '/resource'
    | '/cluster/:clusterId/params'
    | '/cluster/:clusterId/backup'
    | '/cluster/:clusterId'
    | '/cluster'
    | '/'
    | string
}
