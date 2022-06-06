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

import { loadRoutes } from '@pages-macro'
import mountRouter from '@/router'
import { IPageMeta } from '@/model/page'

export default function prepareApps() {
  return mountRouter(
    [
      loadRoutes<IPageMeta>('./landing', '/login'),
      loadRoutes<IPageMeta>('./user', '/user'),
      loadRoutes<IPageMeta>('./main', '/'),
    ],
    {
      noSession: '/login',
      noSafeSession: '/user/password',
      noPermission: '/login',
    }
  )
}
