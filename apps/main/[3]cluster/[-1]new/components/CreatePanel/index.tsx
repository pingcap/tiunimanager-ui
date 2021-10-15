import { Form, Layout, message } from 'antd'
import { useCallback } from 'react'

import styles from './index.module.less'
import { ClusterapiCreateReq } from '#/api'
import { invalidateClustersList, useCreateCluster } from '@/api/cluster'
import { useQueryClient } from 'react-query'
import { loadI18n, useI18n } from '@i18n-macro'
import { errToMsg } from '@/utils/error'
import { CreateClusterForm } from '@/components/CreateClusterPanel'

loadI18n()

export interface CreatePanelProps {
  back: () => void
}

export function CreatePanel({ back }: CreatePanelProps) {
  const [form] = Form.useForm()
  const { t, i18n } = useI18n()

  const queryClient = useQueryClient()
  const createCluster = useCreateCluster()

  const handleSubmit = useCallback(
    (value: ClusterapiCreateReq) => {
      // create
      createCluster.mutateAsync(value, {
        onSuccess(data) {
          invalidateClustersList(queryClient)
          message
            .success(
              t('message.success', { msg: data.data.data!.clusterName }),
              0.8
            )
            .then(back)
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
    [back, createCluster.mutateAsync, queryClient, i18n.language]
  )

  return (
    <Layout className={styles.panel}>
      <CreateClusterForm
        form={form}
        onSubmit={handleSubmit}
        footerClassName={styles.footer}
      />
    </Layout>
  )
}
