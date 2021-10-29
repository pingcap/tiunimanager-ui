import { Button, Form, Input, InputNumber, message, Modal, Select } from 'antd'
import { loadI18n, useI18n } from '@i18n-macro'
import { invalidateClustersList, useTakeoverCluster } from '@/api/hooks/cluster'
import { errToMsg } from '@/utils/error'
import { useQueryClient } from 'react-query'

loadI18n()

export interface TakeoverPanelProps {
  visible: boolean
  close: () => void
}

export function TakeoverModal({ visible, close }: TakeoverPanelProps) {
  const { t } = useI18n()
  const [form] = Form.useForm()
  const onClose = () => {
    close()
    form.resetFields()
  }
  const takeoverCluster = useTakeoverCluster()
  const queryClient = useQueryClient()
  const handleSubmit = async () => {
    const values = await form.validateFields()
    await takeoverCluster.mutateAsync(values, {
      onSuccess() {
        message.success(t('message.success'))
        invalidateClustersList(queryClient)
        onClose()
      },
      onError(e: any) {
        message.error(t('message.fail', { msg: errToMsg(e) }))
      },
    })
  }

  return (
    <Modal
      title={t('title')}
      visible={visible}
      onCancel={onClose}
      maskClosable={false}
      destroyOnClose={true}
      footer={
        <div>
          <Button onClick={onClose}>{t('actions.cancel')}</Button>
          <Button onClick={handleSubmit} type="primary">
            {t('actions.submit')}
          </Button>
        </div>
      }
    >
      <Form
        labelCol={{ span: 6 }}
        colon={false}
        requiredMark={false}
        form={form}
      >
        <Form.Item
          name="host"
          label={t('fields.host')}
          tooltip={t('tooltip.host')}
          initialValue={'192.168.1.1'}
          rules={[
            { required: true },
            {
              pattern:
                /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
              message: 'IP非法',
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="port"
          label={t('fields.port')}
          initialValue={22}
          rules={[{ required: true }]}
        >
          <InputNumber min={0} max={65535} />
        </Form.Item>
        <Form.Item
          name="user"
          label={t('fields.user')}
          tooltip={t('tooltip.user')}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="password" label={t('fields.password')}>
          <Input.Password />
        </Form.Item>
        <Form.Item
          name="tiupPath"
          label={t('fields.tiupPath')}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="clusterNames"
          label={t('fields.clusterNames')}
          tooltip={t('tooltip.clusterNames')}
          rules={[{ required: true }]}
        >
          <Select
            mode="tags"
            tokenSeparators={[',']}
            dropdownStyle={{ display: 'none' }}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
