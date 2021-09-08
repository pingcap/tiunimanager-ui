import { Button, Form, Input, message, Modal } from 'antd'
import styles from './index.module.less'
import { useImportCluster } from '@/api/cluster'
import { errToMsg } from '@/utils/error'
import { useMemo } from 'react'
import { loadI18n, useI18n } from '@i18n-macro'

loadI18n()

export type ImportPanelProps = {
  clusterId: string
  visible: boolean
  close: () => void
}

export function ImportPanel({ clusterId, visible, close }: ImportPanelProps) {
  const [form] = Form.useForm()
  const importCluster = useImportCluster()
  const { t, i18n } = useI18n()
  const formDom = useMemo(() => {
    async function onConfirm() {
      const value = await form.validateFields()
      await importCluster.mutateAsync(
        {
          clusterId,
          ...value,
        },
        {
          onSuccess() {
            message.success(t('import.success'))
            close()
          },
          onError(e: any) {
            message.error(t('import.fail', { msg: errToMsg(e) }))
          },
        }
      )
    }
    return (
      <Form
        className={styles.panel}
        preserve={false}
        form={form}
        layout="horizontal"
        name="import-panel"
        requiredMark={false}
        labelCol={{ span: 4 }}
        colon={false}
        onFinish={onConfirm}
      >
        <h3>{t('form.source')}</h3>
        <Form.Item
          name="filePath"
          label={t('form.filepath')}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <h3>{t('form.target')}</h3>
        <Form.Item
          name="userName"
          label={t('form.username')}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="password" label={t('form.password')}>
          <Input.Password />
        </Form.Item>
        <Form.Item className={styles.actions}>
          <Button className={styles.confirm} type="primary" htmlType="submit">
            {t('form.submit')}
          </Button>
        </Form.Item>
      </Form>
    )
  }, [i18n.language, form, importCluster.mutateAsync])

  return (
    <Modal
      width={720}
      className={styles.modal}
      title={t('title')}
      visible={visible}
      onCancel={close}
      footer={null}
      destroyOnClose={true}
    >
      {formDom}
    </Modal>
  )
}
