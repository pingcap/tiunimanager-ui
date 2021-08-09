import { ReactElement } from 'react'
import { Role } from '@/model/role'
import { Redirector } from '@/router/helper'

export interface IPageMeta {
  // required user role, defaults to ['user']
  role?: Role[]

  // icon in menu
  icon?: ReactElement
  // suspense fallback for lazy children
  fallback?: ReactElement

  redirect?: string | Redirector

  [key: string]: any
}

export function definePage(r: IPageMeta): IPageMeta {
  return r
}
