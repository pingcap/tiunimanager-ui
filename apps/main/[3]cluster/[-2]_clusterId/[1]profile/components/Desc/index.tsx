import { Badge, Descriptions } from 'antd'
import { CopyIconButton } from '@/components/CopyToClipboard'
import { formatTimeString } from '@/utils/time'
import { ClusterapiDetailClusterRsp } from '#/api'
import { loadI18n, useI18n } from '@i18n-macro'
import styles from './index.module.less'

loadI18n()

export type DescProps = {
  cluster: ClusterapiDetailClusterRsp
}

export function Desc({ cluster }: DescProps) {
  const { t } = useI18n()
  return (
    <Descriptions size="small" column={3} className={styles.desc}>
      <Descriptions.Item label={t('label.id')}>
        {cluster.clusterId}
      </Descriptions.Item>
      <Descriptions.Item label={t('label.name')}>
        {cluster.clusterName}
      </Descriptions.Item>
      <Descriptions.Item label={t('label.tag')}>
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
      <Descriptions.Item label={t('label.extranetConnectAddresses')}>
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
      <Descriptions.Item label={t('label.intranetConnectAddresses')}>
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
      <Descriptions.Item label={t('label.port')}>
        {cluster.portList?.join(', ')}
      </Descriptions.Item>
      <Descriptions.Item label={t('label.createTime')}>
        {formatTimeString(cluster.createTime!)}
      </Descriptions.Item>
      {/*Note: do not display updateTime/deleteTime now*/}
      {/*{cluster.updateTime && (*/}
      {/*  <Descriptions.Item label={t('label.updateTime')}>*/}
      {/*    {formatTimeString(cluster.updateTime!)}*/}
      {/*  </Descriptions.Item>*/}
      {/*)}*/}
      {/*{cluster.deleteTime && (*/}
      {/*  <Descriptions.Item label={t('label.deleteTime')}>*/}
      {/*    {formatTimeString(cluster.deleteTime!)}*/}
      {/*  </Descriptions.Item>*/}
      {/*)}*/}
    </Descriptions>
  )
}
