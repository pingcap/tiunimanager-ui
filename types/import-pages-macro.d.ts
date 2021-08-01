declare module '@import-pages-macro' {
  import { ComponentType } from 'react'

  export interface IRoute<T> {
    id: string
    defaultName: string
    path: string
    exact: boolean
    sync: boolean
    component: ComponentType<any>
    meta: T
    children: IRoute<T>[]
  }

  export interface IMenuItem<T> {
    id: string
    defaultName: string
    path: string
    meta: T
    children: IMenuItem<T>[]
  }

  export function importRoutes<T>(pagesPath: string, prefix?: string): IRoute<T>

  export function importMenus<T>(
    pagesPath: string,
    prefix?: string
  ): IMenuItem<T>[]
}
