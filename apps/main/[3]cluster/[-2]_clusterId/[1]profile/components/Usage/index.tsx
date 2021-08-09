import { Card, Col, Row } from 'antd'
import { BigUsageCircle } from '@/components/UsageCircle'
import { ClusterapiDetailClusterRsp } from '#/api'
import styles from './index.module.less'
import { loadI18n, useI18n } from '@i18n-macro'

loadI18n()

export type UsageProps = {
  cluster: ClusterapiDetailClusterRsp
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
            name={t('item.cpu')}
            unit=""
          />
        </Col>
        <Col span={4} offset={1}>
          <BigUsageCircle
            className={styles.usageCard}
            usageRate={cluster.memoryUsage?.usageRate}
            used={cluster.memoryUsage?.used}
            total={cluster.memoryUsage?.total}
            name={t('item.mem')}
            unit="MB"
          />
        </Col>
        <Col span={4} offset={1}>
          <BigUsageCircle
            className={styles.usageCard}
            usageRate={cluster.diskUsage?.usageRate}
            used={cluster.diskUsage?.used}
            total={cluster.diskUsage?.total}
            name={t('item.disk')}
            unit="MB"
          />
        </Col>
        <Col span={4} offset={1}>
          <BigUsageCircle
            className={styles.usageCard}
            usageRate={cluster.storageUsage?.usageRate}
            used={cluster.storageUsage?.used}
            total={cluster.storageUsage?.total}
            name={t('item.storage')}
            unit="MB"
          />
        </Col>
        <Col span={4} offset={1}>
          <BigUsageCircle
            className={styles.usageCard}
            usageRate={cluster.backupFileUsage?.usageRate}
            used={cluster.backupFileUsage?.used}
            total={cluster.backupFileUsage?.total}
            name={t('item.backup')}
            unit="MB"
          />
        </Col>
      </Row>
    </Card>
  )
}
