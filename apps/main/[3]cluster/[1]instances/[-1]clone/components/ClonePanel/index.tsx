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
    return (
      <div className={styles.cloneCard}>
        <Card title={t('cloneInfo.title')}>
          <Form
            hideRequiredMark
            scrollToFirstError
            colon={false}
            form={cloneForm}
            name="clone"
            className={styles.cloneForm}
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
              initialValue={ClusterCloneStrategy.sync}
            >
              <Radio.Group>
                <Radio value={ClusterCloneStrategy.sync}>
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
