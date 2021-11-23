import { Badge, Descriptions } from 'antd'
import { CopyIconButton } from '@/components/CopyToClipboard'
import { formatTimeString } from '@/utils/time'
import { ResponseClusterDetail } from '@/api/model'
import styles from './index.module.less'
import { TFunction, useTranslation } from 'react-i18next'

export type DescProps = {
  cluster: ResponseClusterDetail
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
      <Descriptions.Item label={t('cluster.property.type')}>
        {cluster.clusterType}
      </Descriptions.Item>
      <Descriptions.Item label={t('cluster.property.version')}>
        {cluster.clusterVersion}
      </Descriptions.Item>
      <Descriptions.Item label={t('cluster.property.tls')}>
        {cluster.tls ? (
          <Badge status="processing" text={t('cluster.tls.on')} />
        ) : (
          <Badge status="default" text={t('cluster.tls.off')} />
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
      <Descriptions.Item label={t('cluster.property.status')}>
        {getStatus(t, cluster.statusCode!)}
      </Descriptions.Item>
      <Descriptions.Item label={t('cluster.property.createTime')}>
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

function getStatus(t: TFunction<'model'>, statusCode: string) {
  switch (statusCode) {
    case '0':
      return t('cluster.status.init')
    case '1':
      return t('cluster.status.online')
    case '2':
      return t('cluster.status.offline')
    case '3':
      return t('cluster.status.deleted')
    case 'CreateCluster':
      return t('cluster.status.CreateCluster')
    case 'DeleteCluster':
      return t('cluster.status.DeleteCluster')
    case 'BackupCluster':
      return t('cluster.status.BackupCluster')
    case 'RecoverCluster':
      return t('cluster.status.RecoverCluster')
    case 'ModifyParameters':
      return t('cluster.status.ModifyParameters')
    case 'ExportData':
      return t('cluster.status.ExportData')
    case 'ImportData':
      return t('cluster.status.ImportData')
  }
  return 'unknown'
}
