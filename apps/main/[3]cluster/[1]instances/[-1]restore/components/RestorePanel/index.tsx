import { Card, Col, Form, Input, Layout, message, Row } from 'antd'
import { useCallback, useMemo } from 'react'

import styles from './index.module.less'
import {
  ClusterInfo,
  RequestClusterCreate,
  ClusterBackupItem,
} from '@/api/model'
import { useRestoreClusterBackup } from '@/api/hooks/cluster'
import { useQueryClient } from 'react-query'
import { loadI18n, useI18n } from '@i18n-macro'
import { errToMsg } from '@/utils/error'
import { SimpleForm } from '@/components/CreateClusterPanel'
import { SimpleFormProps } from '@/components/CreateClusterPanel/SimpleForm'

loadI18n()

export interface CreatePanelProps {
  cluster: ClusterInfo
  backup: ClusterBackupItem
  back: () => void
}

export function RestorePanel({ back, cluster, backup }: CreatePanelProps) {
  const [form] = Form.useForm()
  const { t, i18n } = useI18n()

  const queryClient = useQueryClient()
  const restoreCluster = useRestoreClusterBackup()

  const processValue: SimpleFormProps['processValue'] = useCallback(
    (value) => {
      const { id, clusterId } = backup
      ;(value as any).recoverInfo = {
        backupRecordId: id,
        sourceClusterId: clusterId,
      }
      return true
    },
    [backup]
  )

  const handleSubmit = useCallback(
    (value: RequestClusterCreate) => {
      restoreCluster.mutateAsync(value, {
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
      })
    },
    [back, restoreCluster.mutateAsync, queryClient, i18n.language]
  )

  const restoreInfo = useMemo(() => {
    return (
      <Card title={t('restore-info.title')}>
        <Row>
          <Col span={8}>
            <Form.Item
              label={t('restore-info.fields.clusterId')}
              tooltip={t('restore-info.tips.not-editable')}
            >
              <Input disabled={true} value={backup!.clusterId} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={t('restore-info.fields.clusterName')}
              tooltip={t('restore-info.tips.not-editable')}
            >
              <Input disabled={true} value={cluster.clusterName} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={t('restore-info.fields.backupId')}
              tooltip={t('restore-info.tips.not-editable')}
            >
              <Input disabled={true} value={backup!.id} />
            </Form.Item>
          </Col>
        </Row>
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
