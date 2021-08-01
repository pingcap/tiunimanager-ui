import { ReactElement } from 'react'
import { Role } from '@/model/role'
import { Routes } from '@routes'

export interface IPageMeta {
  // required user role, defaults to ['user']
  role?: Role[]

  // icon in menu
  icon?: ReactElement
  // suspense fallback for lazy children
  fallback?: ReactElement

  redirect?: Routes | (() => Routes | undefined | null | false)

  [key: string]: any
}

export function definePage(r: IPageMeta): IPageMeta {
  return r
}
