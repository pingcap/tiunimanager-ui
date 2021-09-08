import { Badge, Descriptions } from 'antd'
import { CopyIconButton } from '@/components/CopyToClipboard'
import { formatTimeString } from '@/utils/time'
import { ClusterapiDetailClusterRsp } from '#/api'
import { loadI18n, useI18n } from '@i18n-macro'
import styles from './index.module.less'
import { TFunction } from 'react-i18next'

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
      <Descriptions.Item label={t('label.status')}>
        {getStatus(t, cluster.statusCode!)}
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

function getStatus(t: TFunction<''>, statusCode: string) {
  switch (statusCode) {
    case '0':
      return t('status.idle')
    case '1':
      return t('status.online')
    case '2':
      return t('status.offline')
    case '3':
      return t('status.deleted')
    case 'CreateCluster':
      return t('status.CreateCluster')
    case 'DeleteCluster':
      return t('status.DeleteCluster')
    case 'BackupCluster':
      return t('status.BackupCluster')
    case 'RecoverCluster':
      return t('status.RecoverCluster')
    case 'ModifyParameters':
      return t('status.ModifyParameters')
    case 'ExportData':
      return t('status.ExportData')
    case 'ImportData':
      return t('status.ImportData')
  }
  return 'unknown'
}
