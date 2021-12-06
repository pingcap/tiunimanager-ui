import { Form, Layout, message } from 'antd'
import { useCallback, useState } from 'react'

import styles from './index.module.less'
import { RequestClusterCreate } from '@/api/model'
import { invalidateClustersList, useCreateCluster } from '@/api/hooks/cluster'
import { useQueryClient } from 'react-query'
import { loadI18n, useI18n } from '@i18n-macro'
import { errToMsg } from '@/utils/error'
import {
  ModeSelector,
  SimpleForm,
  StandardForm,
} from '@/components/CreateClusterPanel'
import { FormMode } from '@/components/CreateClusterPanel/ModeSelector'
import { showAsyncTaskCreatedNotification } from '@/utils/notification'
import { useHistory } from 'react-router-dom'
import { resolveRoute } from '@pages-macro'

loadI18n()

export interface CreatePanelProps {
  back: () => void
}

export function CreatePanel({ back }: CreatePanelProps) {
  const [form] = Form.useForm()
  const { t, i18n } = useI18n()
  const history = useHistory()

  const queryClient = useQueryClient()
  const createCluster = useCreateCluster()

  const handleSubmit = useCallback(
    (value: RequestClusterCreate) => {
      createCluster.mutateAsync(value, {
        onSuccess(data) {
          invalidateClustersList(queryClient)
          showAsyncTaskCreatedNotification({
            taskID: data.data.data?.inProcessFlowId || 0,
            taskName: 'CreateCluster', // FIXME: replace it with translation after tasks translations are done.
            toDetail: () => history.push(resolveRoute('../../../task')),
          })
          back()
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
    [back, history, createCluster.mutateAsync, queryClient, i18n.language]
  )

  const [mode, setMode] = useState<FormMode>('simple')
  return (
    <Layout className={styles.panel}>
      <ModeSelector mode={mode} onChange={setMode} />
      {mode === 'simple' ? (
        <SimpleForm
          form={form}
          onSubmit={handleSubmit}
          footerClassName={styles.footer}
        />
      ) : (
        <StandardForm
          form={form}
          onSubmit={handleSubmit}
          footerClassName={styles.footer}
        />
      )}
    </Layout>
  )
}
