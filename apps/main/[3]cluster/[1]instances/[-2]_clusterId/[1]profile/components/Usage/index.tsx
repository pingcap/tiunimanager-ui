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

import { Card, Col, Row } from 'antd'
import { BigUsageCircle } from '@/components/UsageCircle'
import { ClusterInfo } from '@/api/model'
import styles from './index.module.less'
import { loadI18n, useI18n } from '@i18n-macro'

loadI18n()

export type UsageProps = {
  cluster: ClusterInfo
}

export function Usage({ cluster }: UsageProps) {
  const { t } = useI18n()
  return (
    <Card title={t('title')} bordered={false}>
      <Row>
        <Col span={4}>
          <BigUsageCircle
            className={styles.usageCard}
            usageRate={cluster.cpuUsage?.usageRate}
            used={cluster.cpuUsage?.used}
            total={cluster.cpuUsage?.total}
            name={t('model:cluster.usage.cpu')}
            unit=""
          />
        </Col>
        <Col span={4} offset={1}>
          <BigUsageCircle
            className={styles.usageCard}
            usageRate={cluster.memoryUsage?.usageRate}
            used={cluster.memoryUsage?.used}
            total={cluster.memoryUsage?.total}
            name={t('model:cluster.usage.memory')}
            unit="MB"
          />
        </Col>
        <Col span={4} offset={1}>
          <BigUsageCircle
            className={styles.usageCard}
            usageRate={cluster.storageUsage?.usageRate}
            used={cluster.storageUsage?.used}
            total={cluster.storageUsage?.total}
            name={t('model:cluster.usage.storage')}
            unit="MB"
          />
        </Col>
        <Col span={4} offset={1}>
          <BigUsageCircle
            className={styles.usageCard}
            usageRate={cluster.backupFileUsage?.usageRate}
            used={cluster.backupFileUsage?.used}
            total={cluster.backupFileUsage?.total}
            name={t('model:cluster.usage.backup')}
            unit="MB"
          />
        </Col>
      </Row>
    </Card>
  )
}
