import { Card, Form, Input, Layout } from 'antd'
import { useCallback, useMemo } from 'react'

import styles from './index.module.less'
import {
  ClusterBackupItem,
  ClusterInfo,
  RequestClusterCreate,
} from '@/api/model'
import { useRestoreClusterBackup } from '@/api/hooks/cluster'
import { useQueryClient } from 'react-query'
import { loadI18n, useI18n } from '@i18n-macro'
import { SimpleForm } from '@/components/CreateClusterPanel'
import { SimpleFormProps } from '@/components/CreateClusterPanel/SimpleForm'

loadI18n()

export interface RestorePanelProps {
  cluster: ClusterInfo
  backup: ClusterBackupItem
  back: () => void
}

export function RestorePanel({ back, cluster, backup }: RestorePanelProps) {
  const [form] = Form.useForm()
  const { t, i18n } = useI18n()

  const queryClient = useQueryClient()
  const restoreCluster = useRestoreClusterBackup()

  const processValue: SimpleFormProps['processValue'] = useCallback(
    (value) => {
      ;(value as any).backupId = backup.id
      ;(value as any).clusterId = backup.clusterId
      return true
    },
    [backup]
  )

  const handleSubmit = useCallback(
    (value: RequestClusterCreate /*& { backupId: string }*/) => {
      restoreCluster.mutateAsync(
        {
          payload: {
            backupId: '', // FIXME: make type happy
            ...value,
          },
          options: {
            successMessage: t('message.success'),
            errorMessage: t('message.failed'),
          },
        },
        {
          onSuccess() {
            back()
          },
        }
      )
    },
    [back, restoreCluster.mutateAsync, queryClient, i18n.language]
  )

  const restoreInfo = useMemo(() => {
    return (
      <Card title={t('restore-info.title')} bordered={false}>
        <Form.Item
          label={t('restore-info.fields.clusterId')}
          tooltip={t('restore-info.tips.not-editable')}
        >
          <Input disabled={true} value={backup!.clusterId} />
        </Form.Item>
        <Form.Item
          label={t('restore-info.fields.clusterName')}
          tooltip={t('restore-info.tips.not-editable')}
        >
          <Input disabled={true} value={cluster.clusterName} />
        </Form.Item>
        <Form.Item
          label={t('restore-info.fields.backupId')}
          tooltip={t('restore-info.tips.not-editable')}
        >
          <Input disabled={true} value={backup!.id} />
        </Form.Item>
      </Card>
    )
  }, [cluster, backup, i18n.language])

  return (
    <Layout className={styles.panel}>
      <SimpleForm
        form={form}
        additionalOptions={restoreInfo}
        onSubmit={handleSubmit}
        footerClassName={styles.footer}
        processValue={processValue}
      />
    </Layout>
  )
}
