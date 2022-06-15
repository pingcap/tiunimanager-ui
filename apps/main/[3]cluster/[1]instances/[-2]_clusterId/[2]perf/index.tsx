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

import { useMemo, useRef, useState } from 'react'
import { loadI18n, useI18n } from '@i18n-macro'
import { CardTabListType } from 'antd/es/card'
import { Card } from 'antd'
import { DashboardPages, EmbedDashboard } from '@/components/EmbedDashboard'
import styles from './index.module.less'
import { useClusterContext } from '@apps/main/[3]cluster/[1]instances/[-2]_clusterId/context'
import { useQueryClusterDashboard } from '@/api/hooks/cluster'
import { FullScreen } from '@/components/FullScreen'

loadI18n()

export default function () {
  const { info } = useClusterContext()
  const { clusterId } = info!

  const { data, isLoading } = useQueryClusterDashboard(
    { id: clusterId! },
    {
      refetchOnWindowFocus: false,
    }
  )

  const [url, token] = useMemo(
    () => (isLoading ? [] : [data!.data.data!.url!, data!.data.data!.token!]),
    [isLoading, data]
  )

  const { t, i18n } = useI18n()

  const menuItems: CardTabListType[] = useMemo(
    () => [
      { key: '/statement', tab: t('pages.statement') },
      { key: '/slow_query', tab: t('pages.slow_query') },
      { key: '/keyviz', tab: t('pages.keyviz') },
      { key: '/diagnose', tab: t('pages.diagnose') },
    ],
    [i18n.language]
  )

  const perfRef = useRef<HTMLDivElement | null>(null)
  const dashboardRef = useRef<HTMLIFrameElement | null>(null)

  const [path, setPath] = useState<DashboardPages>('/statement')

  return (
    <div className={styles.perfPanel} ref={(r) => (perfRef.current = r)}>
      <Card
        style={{ width: '100%' }}
        tabList={menuItems}
        defaultActiveTabKey={'/statement'}
        onTabChange={(key) => {
          setPath(key as DashboardPages)
        }}
        bordered={false}
        tabProps={{
          centered: true,
          size: 'large',
        }}
        tabBarExtraContent={<FullScreen domRef={perfRef} />}
      >
        {!url || !token ? (
          <>Loading...</>
        ) : (
          <EmbedDashboard
            className={styles.dashboard}
            iframeRef={(iframe) => (dashboardRef.current = iframe)}
            token={token}
            path={path}
            url={url}
          />
        )}
      </Card>
    </div>
  )
}
