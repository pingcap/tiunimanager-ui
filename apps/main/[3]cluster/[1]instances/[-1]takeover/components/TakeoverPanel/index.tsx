import { Button, Card, Form, Input, InputNumber, Layout } from 'antd'
import { loadI18n, useI18n } from '@i18n-macro'
import { useQueryClient } from 'react-query'
import { invalidateClustersList, useClusterTakeover } from '@/api/hooks/cluster'
import styles from './index.module.less'
import { HostsUploader } from '@/components/HostsUploader'

loadI18n()

export interface TakeoverPanelProps {
  back: () => void
}

export function TakeoverPanel({ back }: TakeoverPanelProps) {
  const { t } = useI18n()
  const [form] = Form.useForm()
  const takeoverCluster = useClusterTakeover()
  const queryClient = useQueryClient()
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      await takeoverCluster.mutateAsync(
        {
          ...values,
          options: {
            actionName: t('actionName'),
          },
        },
        {
          onSuccess() {
            invalidateClustersList(queryClient)
            back()
          },
        }
      )
    } catch (e) {
      // NO_OP
    }
  }

  return (
    <Layout className={styles.panel}>
      <Form colon={false} requiredMark={false} form={form}>
        <Card title={t('form.basic.title')}>
          <Form.Item
            name="clusterName"
            label={t('form.basic.fields.name')}
            tooltip={t('tooltip.clusterName')}
            rules={[
              { required: true },
              { min: 8, max: 32, message: t('rules.clusterName.length') },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="dbUser"
            label={t('form.basic.fields.username')}
            tooltip={t('tooltip.clusterUsername')}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="dbPassword"
            label={t('form.basic.fields.password')}
            tooltip={t('tooltip.password')}
            rules={[{ required: true }]}
          >
            <Input.Password />
          </Form.Item>
        </Card>
        <Card title={t('form.jumpServer.title')}>
          <Form.Item
            name="TiUPIp"
            label={t('form.jumpServer.fields.ip')}
            initialValue={'192.168.1.1'}
            rules={[
              { required: true },
              {
                pattern:
                  /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
                message: t('rules.ip.format'),
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="TiUPPort"
            label={t('form.jumpServer.fields.port')}
            initialValue={22}
            rules={[{ required: true }]}
          >
            <InputNumber min={0} max={65535} />
          </Form.Item>
          <Form.Item
            name="TiUPUserName"
            label={t('form.jumpServer.fields.user')}
            tooltip={t('tooltip.user')}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="TiUPUserPassword"
            label={t('form.jumpServer.fields.password')}
            rules={[{ required: true }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="TiUPPath"
            label={t('form.jumpServer.fields.tiupPath')}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Card>
        <Card title={t('form.resources.title')}>
          <HostsUploader uploadProps={{ maxCount: undefined }} />
        </Card>
      </Form>
      <div className={`${styles.submitter} ${styles.footer}`}>
        <Button size="large" type="primary" onClick={handleSubmit}>
          {t('footer.submit.title')}
        </Button>
      </div>
    </Layout>
  )
}
