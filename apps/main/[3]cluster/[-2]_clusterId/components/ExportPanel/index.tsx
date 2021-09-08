import { Button, Form, Input, message, Modal, Radio } from 'antd'
import styles from './index.module.less'
import { useExportCluster } from '@/api/cluster'
import { errToMsg } from '@/utils/error'
import { useMemo } from 'react'
import { loadI18n, useI18n } from '@i18n-macro'

loadI18n()

export type ExportPanelProps = {
  clusterId: string
  visible: boolean
  close: () => void
}

export function ExportPanel({ clusterId, visible, close }: ExportPanelProps) {
  const [form] = Form.useForm()
  const exportCluster = useExportCluster()
  const { t, i18n } = useI18n()
  const formDom = useMemo(() => {
    async function onConfirm() {
      const value = await form.validateFields()
      await exportCluster.mutateAsync(
        {
          clusterId,
          ...value,
        },
        {
          onSuccess() {
            message.success(t('export.success'))
            close()
          },
          onError(e: any) {
            message.error(t('export.fail', { msg: errToMsg(e) }))
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
        <h3>{t('form.target')}</h3>
        <Form.Item
          name="filePath"
          label={t('form.filepath')}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="fileType"
          label={t('form.filetype')}
          initialValue="csv"
        >
          <Radio.Group>
            <Radio value="csv">{t('filetype.csv')}</Radio>
            <Radio value="sql">{t('filetype.sql')}</Radio>
          </Radio.Group>
        </Form.Item>
        <h3>{t('form.source')}</h3>
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
  }, [i18n.language, form, exportCluster.mutateAsync])

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
