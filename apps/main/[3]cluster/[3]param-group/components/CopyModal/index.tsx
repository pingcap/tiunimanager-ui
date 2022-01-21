import { useCallback, useEffect, useState } from 'react'
import { loadI18n, useI18n } from '@i18n-macro'
import { Form, Modal, Input } from 'antd'
import type { ParamGroupCopyPayload, CopyActionCallbacks } from './helper'
import type { ParamGroupItem } from '@/api/model'

loadI18n()

type CopyFormFields = ParamGroupCopyPayload

interface ParamGroupCopyModalProps {
  visible: boolean
  dataSource: ParamGroupItem
  onConfirm: (values: CopyFormFields, callbacks: CopyActionCallbacks) => void
  onCancel: () => void
}

const ParamGroupCopyModal: React.FC<ParamGroupCopyModalProps> = ({
  visible,
  dataSource,
  onConfirm,
  onCancel,
}) => {
  const { t, i18n } = useI18n()

  const [form] = Form.useForm<CopyFormFields>()

  const [confirmLoading, setConfirmLoading] = useState(false)

  const onSuccess = useCallback(() => {
    setConfirmLoading(false)
  }, [i18n.language])

  const onError = useCallback(() => {
    setConfirmLoading(false)
  }, [i18n.language])

  const onOk = useCallback(async () => {
    setConfirmLoading(true)

    try {
      const values = await form.validateFields()

      onConfirm(values, {
        onSuccess,
        onError,
      })
    } catch (e) {
      // error
      setConfirmLoading(false)
    }
  }, [form, onSuccess, onError, onConfirm])

  useEffect(() => {
    if (visible) {
      form.resetFields()
    }
  }, [form, visible])

  return (
    <Modal
      visible={visible}
      title={t('modal.title')}
      okText={t('footer.ok.text')}
      cancelText={t('footer.cancel.text')}
      onCancel={onCancel}
      onOk={onOk}
      confirmLoading={confirmLoading}
    >
      <Form
        form={form}
        layout="vertical"
        colon={false}
        requiredMark="optional"
        initialValues={dataSource}
      >
        <Form.Item
          name="name"
          label={t('form.fields.name')}
          rules={[
            { required: true, message: t('form.rules.name.required') },
            { min: 1, max: 22, message: t('form.rules.name.length') },
            {
              validator: (rule, value) =>
                value !== dataSource.name
                  ? Promise.resolve()
                  : Promise.reject(new Error(t('form.rules.name.duplicate'))),
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="note" label={t('form.fields.note')}>
          <Input.TextArea allowClear autoSize={{ minRows: 2, maxRows: 6 }} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default ParamGroupCopyModal
