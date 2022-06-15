/*
 * Copyright 2022 PingCAP
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Form, Layout } from 'antd'
import { useCallback, useState } from 'react'

import styles from './index.module.less'
import { RequestClusterCreate } from '@/api/model'
import { invalidateClustersList, useCreateCluster } from '@/api/hooks/cluster'
import { useQueryClient } from 'react-query'
import { loadI18n, useI18n } from '@i18n-macro'
import {
  ModeSelector,
  SimpleForm,
  StandardForm,
} from '@/components/CreateClusterPanel'
import { FormMode } from '@/components/CreateClusterPanel/ModeSelector'

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
    (value: RequestClusterCreate) => {
      createCluster.mutateAsync(
        {
          payload: value,
          options: {
            successMessage: t('message.success'),
            errorMessage: t('message.failed'),
          },
        },
        {
          onSuccess() {
            invalidateClustersList(queryClient)
            back()
          },
        }
      )
    },
    [back, createCluster.mutateAsync, queryClient, i18n.language]
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
