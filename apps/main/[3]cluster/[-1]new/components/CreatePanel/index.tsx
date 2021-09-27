import { Card, Form, Input, Layout, message } from 'antd'
import { useCallback, useMemo } from 'react'

import styles from './index.module.less'
import { ClusterapiCreateReq, ClusterapiRecoverInfo } from '#/api'
import {
  invalidateClustersList,
  useCreateCluster,
  useRestoreClusterBackup,
} from '@/api/cluster'
import { useQueryClient } from 'react-query'
import { loadI18n, useI18n } from '@i18n-macro'
import { errToMsg } from '@/utils/error'
import {
  CreateClusterForm,
  CreateClusterSubmitter,
} from '@/components/CreateClusterPanel'
import { useRouteQuery } from '@hooks/useRouteQuery'

loadI18n()

export interface CreatePanelProps {
  back: () => void
}

export function CreatePanel({ back }: CreatePanelProps) {
  const [form] = Form.useForm()
  const { t, i18n } = useI18n()

  const restoreParams = useRestoreParams()

  const queryClient = useQueryClient()
  const createCluster = useCreateCluster()
  const restoreCluster = useRestoreClusterBackup()

  const handleSubmit = useCallback(
    (value: ClusterapiCreateReq) => {
      if (restoreParams) {
        // restore
        restoreCluster.mutateAsync(
          {
            recoverInfo: restoreParams,
            ...value,
          },
          {
            onSuccess() {
              message.success(t('restore.success'), 0.8).then(back)
            },
            onError(e: any) {
              message.error(
                t('restore.fail', {
                  msg: errToMsg(e),
                })
              )
            },
          }
        )
      } else {
        // create
        createCluster.mutateAsync(value, {
          onSuccess(data) {
            invalidateClustersList(queryClient)
            message
              .success(
                t('create.success', { msg: data.data.data!.clusterName }),
                0.8
              )
              .then(back)
          },
          onError(e: any) {
            message.error(
              t('create.fail', {
                msg: errToMsg(e),
              })
            )
          },
        })
      }
    },
    [
      back,
      restoreParams,
      createCluster.mutateAsync,
      restoreCluster.mutateAsync,
      queryClient,
      i18n.language,
    ]
  )

  const footer = useMemo(
    () => (
      <CreateClusterSubmitter
        form={form}
        onReset={() => form.resetFields()}
        onCreate={handleSubmit}
        wrapperClassName={styles.footer}
      />
    ),
    [form, handleSubmit, i18n.language]
  )

  const restoreInfo = useMemo(() => {
    if (!restoreParams) return null
    return (
      <Card title={t('restore.title')}>
        <Form.Item
          label={t('restore.fields.clusterId')}
          tooltip={t('restore.tips.not-editable')}
        >
          <Input disabled={true} value={restoreParams.sourceClusterId} />
        </Form.Item>
        <Form.Item
          label={t('restore.fields.backupId')}
          tooltip={t('restore.tips.not-editable')}
        >
          <Input disabled={true} value={restoreParams.backupRecordId} />
        </Form.Item>
      </Card>
    )
  }, [restoreParams, i18n.language])

  return (
    <Layout className={styles.panel}>
      <CreateClusterForm form={form} additionalOptions={restoreInfo} />
      {footer}
    </Layout>
  )
}

function useRestoreParams() {
  const routeQuery = useRouteQuery()
  return useMemo(() => {
    try {
      const clusterId = routeQuery.get('clusterId')
      const backupId = routeQuery.get('backupId')
      if (!clusterId || !backupId) return
      return {
        sourceClusterId: clusterId,
        backupRecordId: parseInt(backupId),
      } as ClusterapiRecoverInfo
    } catch (e) {
      return
    }
  }, [routeQuery])
}
