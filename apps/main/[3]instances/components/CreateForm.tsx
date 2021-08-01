import { Button, Divider, Drawer, Form, Input, InputNumber, Select } from 'antd'
import { CSSProperties } from 'react'

import styles from './CreateForm.module.less'
import { APIS } from '@/api/client'
import { useAuthState } from '@store/auth'

// TODO: i18n for create instance form

export interface CreateFormProps {
  onClose: () => void
  onCreated: () => void
  visible: boolean
  bodyStyle?: CSSProperties
}

export function CreateForm({
  onClose,
  visible,
  bodyStyle,
  onCreated,
}: CreateFormProps) {
  const [{ token }] = useAuthState()
  const [form] = Form.useForm()

  const close = () => {
    onClose()
    form.resetFields()
  }

  // TODO: add validation

  const basicOptions = (
    <>
      <Divider>基本配置</Divider>
      <Form.Item
        name="instanceName"
        label="实例名称"
        tooltip="必填"
        rules={[{ required: true, message: '请输入实例名称' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="dbPassword"
        label="实例密码"
        tooltip="必填"
        rules={[{ required: true, message: '请输入实例密码' }]}
      >
        <Input.Password />
      </Form.Item>
      <Form.Item
        name="instanceVersion"
        label="实例版本"
        tooltip="必填"
        rules={[{ required: true, message: '请选择实例版本' }]}
        initialValue="5.1"
      >
        <Select>
          {/* TODO: where to get version ? */}
          <Select.Option value="5.1">TiDB 5.1.x</Select.Option>
          <Select.Option value="5.0">TiDB 5.0.x</Select.Option>
          <Select.Option value="4.0">TiDB 4.0.x</Select.Option>
        </Select>
      </Form.Item>
    </>
  )

  const tidbOptions = (
    <>
      <Divider>TiDB 配置</Divider>
      <Form.Item
        name="tiDBCount"
        label="节点数量"
        tooltip="必填"
        rules={[{ required: true, message: '请输入 TiDB 节点数量' }]}
        initialValue={1}
      >
        <InputNumber min={1} />
      </Form.Item>
    </>
  )

  const pdOptions = (
    <>
      <Divider>PD 配置</Divider>
      <Form.Item
        name="pdCount"
        label="副本数量"
        tooltip="必填"
        rules={[{ required: true, message: '请输入 PD 副本数量' }]}
        initialValue={1}
      >
        <InputNumber min={1} />
      </Form.Item>
    </>
  )

  const tikvOptions = (
    <>
      <Divider>TiKV 配置</Divider>
      <Form.Item
        name="tiKVCount"
        label="副本数量"
        tooltip="必填"
        rules={[{ required: true, message: '请输入 TiKV 副本数量' }]}
        initialValue={3}
      >
        <InputNumber min={1} />
      </Form.Item>
    </>
  )

  return (
    <Drawer
      title="新建实例"
      width={480}
      onClose={close}
      visible={visible}
      bodyStyle={{
        paddingTop: 0,
        ...bodyStyle,
      }}
      maskClosable={false}
      footer={
        <div
          style={{
            textAlign: 'right',
          }}
        >
          <Button onClick={close} style={{ marginRight: 8 }}>
            取消
          </Button>
          <Button
            onClick={async () => {
              try {
                const fields = await form.validateFields()
                // TODO: use react-query
                await APIS.Instance.instanceCreatePost(token, fields)
                // TODO: show notification and fresh table for new instance
                close()
                onCreated()
              } catch (e) {
                // TODO: show err message
              }
            }}
            type="primary"
          >
            创建
          </Button>
        </div>
      }
    >
      <Form
        layout="horizontal"
        hideRequiredMark
        form={form}
        className={styles.form}
      >
        {basicOptions}
        {tidbOptions}
        {pdOptions}
        {tikvOptions}
      </Form>
    </Drawer>
  )
}
