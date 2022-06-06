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

import { AntdI18nProvider, init as initI18n } from '@/i18n'
import { StrictMode } from 'react'
import { render } from 'react-dom'
import prepareApps from '@apps/index'
import { APIProvider } from '@/api/client'
import { wrap } from '@components-macro'

export default async function bootstrap() {
  /*
   * Init i18n
   * */
  await initI18n()

  /*
   * Init Apps
   * */
  const apps = prepareApps()

  /*
   * Mount Apps
   * */
  render(
    wrap(apps, AntdI18nProvider, APIProvider, StrictMode),
    document.getElementById('root')
  )
}
