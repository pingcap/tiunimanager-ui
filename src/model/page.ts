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
