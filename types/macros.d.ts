declare module '@i18n-macro' {
  /** load i18n resources by glob pattern. */
  export function loadI18n(glob?: string): void
  /** load i18n resources by glob pattern. */
  export function loadI18nWithNS(ns: string, glob?: string): void
  import { UseTranslationResponse } from 'react-i18next'
  /** a wrapper of useTranslation(), with auto namespace management. */
  export function useI18n(): UseTranslationResponse<''>
  import { TFunction } from 'i18next'
  /** a wrapper of i18next.t(), with auto namespace management. */
  export function getI18n(): TFunction
  /** get the i18n namespace for the current file. */
  export function resolveNamespace(): string
}
declare module '@i18n-macro-helper' {
  import { TFunction } from 'i18next'
  export function onI18nInitialized(hook: () => void): void
  export function withNamespace(ns: string | string[]): TFunction
}
declare module '@assets-macro' {
  /** import all assets by glob pattern. */
  export function importAssets(glob: string): void
}
declare module '@pages-macro' {
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
  /** get routes tree by the path of the root directory of pages and the prefix of target routes. */
  export function loadRoutes<T>(pagesPath: string, prefix?: string): IRoute<T>

  export interface IMenuItem<T> {
    id: string
    defaultName: string
    path: string
    meta: T
    children: IMenuItem<T>[]
  }
  /** get menu tree by the path of the root directory of pages and the route prefix of these menus.
if prefix is left unset, the route of the current file will be used as the route prefix of the menus. */
  export function loadMenus<T>(
    pagesPath: string,
    prefix?: string
  ): IMenuItem<T>[]
  /** get the route path by relative path.
if relativePath is left unset, returns the route path of current file. */
  export function resolveRoute(
    relativePath?: string,
    ...params: string[]
  ): string
}
declare module '@components-macro' {
  import { ReactElement, ComponentType } from 'react'
  export function wrap(
    target: ReactElement,
    ...wrappers: ComponentType[]
  ): ReactElement
}
