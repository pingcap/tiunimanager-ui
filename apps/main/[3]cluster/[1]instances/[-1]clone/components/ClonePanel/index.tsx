/*
 * Copyright 2022 PingCAP, Inc.
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

import { FC, useCallback, useMemo } from 'react'
import { Card, Form, Input, Layout, Radio } from 'antd'
import { useQueryClient } from 'react-query'
import { Trans } from 'react-i18next'
import { loadI18n, useI18n } from '@i18n-macro'
import {
  ClusterCloneStrategy,
  ClusterInfo,
  RequestClusterClone,
  RequestClusterCreate,
} from '@/api/model'
import { useClusterClone } from '@/api/hooks/cluster'
import { SimpleForm } from '@/components/CreateClusterPanel'
// import { SimpleFormProps } from '@/components/CreateClusterPanel/SimpleForm'

import styles from './index.module.less'

loadI18n()

export interface ClonePanelProps {
  cluster: ClusterInfo
  back: () => void
}

const ClonePanel: FC<ClonePanelProps> = ({ back, cluster }) => {
  const [creationForm] = Form.useForm<RequestClusterCreate>()
  const [cloneForm] = Form.useForm<Pick<RequestClusterClone, 'cloneStrategy'>>()
  const { t, i18n } = useI18n()

  const queryClient = useQueryClient()
  const cloneCluster = useClusterClone()

  const handleSubmit = useCallback(
    (value: RequestClusterCreate) => {
      cloneCluster.mutateAsync(
        {
          payload: {
            ...value,
            sourceClusterId: cluster.clusterId!,
            cloneStrategy: cloneForm.getFieldValue('cloneStrategy'),
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
    [
      queryClient,
      i18n.language,
      cloneCluster.mutateAsync,
      back,
      cluster,
      cloneForm,
    ]
  )

  const cloneInfo = useMemo(() => {
    // The "sync" strategy is disabled on slave clusters
    const syncDisabled = !!cluster.relations?.masters?.length

    return (
      <div className={styles.cloneCard}>
        <Card title={t('cloneInfo.title')} bordered={false}>
          <Form
            hideRequiredMark
            scrollToFirstError
            colon={false}
            form={cloneForm}
            name="clone"
            className={styles.cloneForm}
            initialValues={{
              cloneStrategy: syncDisabled
                ? ClusterCloneStrategy.snapshot
                : ClusterCloneStrategy.sync,
            }}
          >
            <Form.Item label={t('cloneInfo.fields.clusterId')}>
              <Input disabled={true} value={cluster.clusterId} />
            </Form.Item>
            <Form.Item label={t('cloneInfo.fields.clusterName')}>
              <Input disabled={true} value={cluster.clusterName} />
            </Form.Item>
            <Form.Item
              name="cloneStrategy"
              label={t('cloneInfo.fields.cloneStrategy')}
              tooltip={<Trans t={t} i18nKey="cloneInfo.tips.cloneStrategy" />}
            >
              <Radio.Group>
                <Radio
                  value={ClusterCloneStrategy.sync}
                  disabled={syncDisabled}
                >
                  {t('cloneStrategy.sync')}
                </Radio>
                <Radio value={ClusterCloneStrategy.snapshot}>
                  {t('cloneStrategy.snapshot')}
                </Radio>
              </Radio.Group>
            </Form.Item>
          </Form>
        </Card>
      </div>
    )
  }, [cluster, i18n.language])

  return (
    <Layout className={styles.panel}>
      {cloneInfo}
      <SimpleForm
        footerClassName={styles.footer}
        form={creationForm}
        onSubmit={handleSubmit}
      />
    </Layout>
  )
}

export default ClonePanel
