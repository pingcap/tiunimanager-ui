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

import { message } from 'antd'
import { IframeHTMLAttributes, Ref, useState } from 'react'
import { loadI18n, useI18n } from '@i18n-macro'

loadI18n()

export interface EmbedDashboardProps
  extends IframeHTMLAttributes<HTMLIFrameElement> {
  iframeRef?: Ref<HTMLIFrameElement>
  token: string
  // redirectPath: DashboardPages
  path: DashboardPages
  url: string
}

export type DashboardPages =
  | '/statement'
  | '/slow_query'
  | '/keyviz'
  | '/diagnose'

export function EmbedDashboard({
  token,
  url,
  path,
  iframeRef,
  ...attrs
}: EmbedDashboardProps) {
  const portalUrl = `${url}#/portal`
  const pageUrl = `${url}#${path}`
  const { t, i18n } = useI18n()
  const [loaded, setLoaded] = useState(false)

  return (
    <iframe
      id="dashboard"
      ref={iframeRef}
      width="100%"
      scrolling="no"
      frameBorder="0"
      src={loaded ? pageUrl : portalUrl}
      {...attrs}
      onLoad={(e) => {
        if (!(e.target as HTMLIFrameElement).contentWindow)
          message.error(t('load.fail'))
        else {
          ;(e.target as HTMLIFrameElement).contentWindow?.postMessage(
            {
              type: 'DASHBOARD_PORTAL_EVENT',
              lang: i18n.language,
              hideNav: true,
              token,
              redirectPath: path,
            },
            '*'
          )
          setLoaded(true)
        }
      }}
    />
  )
}
