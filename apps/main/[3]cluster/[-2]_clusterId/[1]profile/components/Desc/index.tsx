import { Badge, Descriptions } from 'antd'
import styles from '@apps/main/[3]cluster/[-2]_clusterId/[1]profile/index.module.less'
import { CopyIconButton } from '@/components/CopyToClipboard'
import { formatTimeString } from '@/utils/time'
import { ClusterapiDetailClusterRsp } from '#/api'
import { loadI18n, useI18n } from '@i18n-macro'

loadI18n()

export type DescProps = {
  cluster: ClusterapiDetailClusterRsp
}

export function Desc({ cluster }: DescProps) {
  const { t } = useI18n()
  return (
    <Descriptions size="small" bordered column={4}>
      <Descriptions.Item label={t('label.id')}>
        {cluster.clusterId}
      </Descriptions.Item>
      <Descriptions.Item label={t('label.name')}>
        {cluster.clusterName}
      </Descriptions.Item>
      <Descriptions.Item label={t('label.tag')} span={2}>
        {cluster.tags?.join(', ') || ' '}
      </Descriptions.Item>
      <Descriptions.Item label={t('label.type')}>
        {cluster.clusterType}
      </Descriptions.Item>
      <Descriptions.Item label={t('label.version')}>
        {cluster.clusterVersion}
      </Descriptions.Item>
      <Descriptions.Item label={t('label.tls')}>
        {cluster.tls ? (
          <Badge status="processing" text={t('tls.enable')} />
        ) : (
          <Badge status="default" text={t('tls.disable')} />
        )}
      </Descriptions.Item>
      <Descriptions.Item label={t('label.port')}>
        {cluster.port}
      </Descriptions.Item>
      <Descriptions.Item label={t('label.extranetConnectAddresses')} span={2}>
        {cluster.extranetConnectAddresses?.map((a) => (
          <span className={styles.address} key={a}>
            <CopyIconButton
              text={a}
              tip={t('addresses.copy')}
              message={t('addresses.success', { content: a })}
            />{' '}
            {a}
          </span>
        ))}
      </Descriptions.Item>
      <Descriptions.Item label={t('label.intranetConnectAddresses')} span={2}>
        {cluster.intranetConnectAddresses?.map((a) => (
          <span className={styles.address} key={a}>
            <CopyIconButton
              text={a}
              tip={t('addresses.copy')}
              message={t('addresses.success', { content: a })}
            />{' '}
            {a}
          </span>
        ))}
      </Descriptions.Item>
      <Descriptions.Item label={t('label.createTime')}>
        {formatTimeString(cluster.createTime!)}
      </Descriptions.Item>
      {cluster.updateTime && (
        <Descriptions.Item label={t('label.updateTime')}>
          {formatTimeString(cluster.updateTime!)}
        </Descriptions.Item>
      )}
      {cluster.deleteTime && (
        <Descriptions.Item label={t('label.deleteTime')}>
          {formatTimeString(cluster.deleteTime!)}
        </Descriptions.Item>
      )}
    </Descriptions>
  )
}
