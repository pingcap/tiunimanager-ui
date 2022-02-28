import { useCallback } from 'react'
import { TFunction, useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'
import { Badge, Button, Descriptions, Space } from 'antd'
import { resolveRoute } from '@pages-macro'
import { loadI18n, useI18n } from '@i18n-macro'
import { formatTimeString } from '@/utils/time'
import { getKeyByValue } from '@/utils/obj'
import { ClusterInfo, ClusterOperationStatus, ClusterStatus } from '@/api/model'
import { CopyIconButton } from '@/components/CopyToClipboard'

import styles from './index.module.less'

loadI18n()

export type DescProps = {
  cluster: ClusterInfo
}

export function Desc({ cluster }: DescProps) {
  const { t } = useTranslation('model')
  return (
    <Descriptions size="small" column={3} className={styles.desc}>
      <Descriptions.Item label={t('cluster.property.id')}>
        {cluster.clusterId}
      </Descriptions.Item>
      <Descriptions.Item label={t('cluster.property.name')}>
        {cluster.clusterName}
      </Descriptions.Item>
      <Descriptions.Item label={t('cluster.property.tag')}>
        {cluster.tags?.join(', ') || ' '}
      </Descriptions.Item>
      <Descriptions.Item label={t('cluster.property.role')}>
        -
      </Descriptions.Item>
      <Descriptions.Item label={t('cluster.property.type')}>
        {cluster.clusterType}
      </Descriptions.Item>
      <Descriptions.Item label={t('cluster.property.version')}>
        {cluster.clusterId && cluster.clusterVersion && (
          <VersionItem
            clusterId={cluster.clusterId}
            clusterVersion={cluster.clusterVersion}
          />
        )}
      </Descriptions.Item>
      <Descriptions.Item label={t('cluster.property.extranetAddress')}>
        {cluster.extranetConnectAddresses?.map((a) => (
          <span className={styles.address} key={a}>
            <CopyIconButton text={a} label={t('cluster.property.address')} />{' '}
            {a}
          </span>
        ))}
      </Descriptions.Item>
      <Descriptions.Item label={t('cluster.property.intranetAddress')}>
        {cluster.intranetConnectAddresses?.map((a) => (
          <span className={styles.address} key={a}>
            <CopyIconButton text={a} label={t('cluster.property.address')} />{' '}
            {a}
          </span>
        ))}
      </Descriptions.Item>
      <Descriptions.Item label={t('cluster.property.tls')}>
        {cluster.tls ? (
          <Badge status="processing" text={t('cluster.tls.on')} />
        ) : (
          <Badge status="default" text={t('cluster.tls.off')} />
        )}
      </Descriptions.Item>
      <Descriptions.Item label={t('cluster.property.status')}>
        {getStatus(t, cluster.status! as ClusterStatus)}
      </Descriptions.Item>
      <Descriptions.Item label={t('cluster.property.operationStatus')}>
        {getOperationStatus(
          t,
          cluster.maintainStatus! as ClusterOperationStatus
        )}
      </Descriptions.Item>
      <Descriptions.Item label={t('cluster.property.storageReplicas')}>
        {cluster.copies}
      </Descriptions.Item>
      <Descriptions.Item label={t('cluster.property.vendor')}>
        {t(`cluster.vendor.${cluster.vendor?.toLowerCase()}`, cluster.vendor)}
      </Descriptions.Item>
      <Descriptions.Item label={t('cluster.property.region')}>
        {cluster.region}
      </Descriptions.Item>
      <Descriptions.Item label={t('cluster.property.exclusive')}>
        {t(
          `cluster.exclusive.${cluster.exclusive}`,
          cluster.exclusive?.toString()
        )}
      </Descriptions.Item>
      <Descriptions.Item label={t('cluster.property.createTime')}>
        {formatTimeString(cluster.createTime!)}
      </Descriptions.Item>
      <Descriptions.Item label={t('cluster.property.updateTime')}>
        {formatTimeString(cluster.updateTime!)}
      </Descriptions.Item>
    </Descriptions>
  )
}

type VersionItemProps = {
  clusterId: string
  clusterVersion: string
}

function VersionItem({ clusterId, clusterVersion }: VersionItemProps) {
  const history = useHistory()

  const handleClick = useCallback(
    () => history.push(resolveRoute('../upgrade', clusterId)),
    [history]
  )

  const { t } = useI18n()

  return (
    <Space>
      {clusterVersion}
      <Button type="link" size="small" onClick={handleClick}>
        {t('actions.upgrade')}
      </Button>
    </Space>
  )
}

function getStatus(t: TFunction<'model'>, status: ClusterStatus) {
  switch (status) {
    case ClusterStatus.initializing:
      return (
        <Badge status="default" text={t('model:cluster.status.initializing')} />
      )
    case ClusterStatus.running:
      return <Badge status="success" text={t('model:cluster.status.running')} />
    case ClusterStatus.recovering:
      return (
        <Badge status="warning" text={t('model:cluster.status.recovering')} />
      )
    case ClusterStatus.stopped:
      return <Badge status="default" text={t('model:cluster.status.stopped')} />
    case ClusterStatus.failure:
      return <Badge status="error" text={t('model:cluster.status.failure')} />
  }
  return 'unknown'
}

function getOperationStatus(
  t: TFunction<'model'>,
  status: ClusterOperationStatus
) {
  if (!status) return '-'
  return (
    <Badge
      status="processing"
      text={t(
        `model:cluster.operationStatus.${getKeyByValue(
          ClusterOperationStatus,
          status
        )}`
      )}
    />
  )
}
