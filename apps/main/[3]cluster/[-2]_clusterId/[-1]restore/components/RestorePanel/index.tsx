import { Card, Form, Input, Layout, message } from 'antd'
import { useCallback, useMemo } from 'react'

import styles from './index.module.less'
import {
  ClusterapiClusterDisplayInfo,
  ClusterapiCreateReq,
  InstanceapiBackupRecord,
} from '#/api'
import { useRestoreClusterBackup } from '@/api/cluster'
import { useQueryClient } from 'react-query'
import { loadI18n, useI18n } from '@i18n-macro'
import { errToMsg } from '@/utils/error'
import { CreateClusterForm } from '@/components/CreateClusterPanel'

loadI18n()

export interface CreatePanelProps {
  cluster: ClusterapiClusterDisplayInfo
  backup: InstanceapiBackupRecord
  back: () => void
}

export function RestorePanel({ back, cluster, backup }: CreatePanelProps) {
  const [form] = Form.useForm()
  const { t, i18n } = useI18n()

  const queryClient = useQueryClient()
  const restoreCluster = useRestoreClusterBackup()

  const handleSubmit = useCallback(
    (value: ClusterapiCreateReq) => {
      const { id, clusterId } = backup
      restoreCluster.mutateAsync(
        {
          recoverInfo: {
            backupRecordId: id,
            sourceClusterId: clusterId,
          },
          ...value,
        },
        {
          onSuccess() {
            message.success(t('message.success'), 0.8).then(back)
          },
          onError(e: any) {
            message.error(
              t('message.fail', {
                msg: errToMsg(e),
              })
            )
          },
        }
      )
    },
    [back, restoreCluster.mutateAsync, queryClient, i18n.language]
  )

  const restoreInfo = useMemo(() => {
    return (
      <Card title={t('restore-info.title')}>
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
        <Form.Item
          label={t('restore-info.fields.backupPath')}
          tooltip={t('restore-info.tips.not-editable')}
        >
          <Input disabled={true} value={backup!.filePath} />
        </Form.Item>
      </Card>
    )
  }, [cluster, backup, i18n.language])

  return (
    <Layout className={styles.panel}>
      <CreateClusterForm
        form={form}
        additionalOptions={restoreInfo}
        onSubmit={handleSubmit}
        footerClassName={styles.footer}
      />
    </Layout>
  )
}
