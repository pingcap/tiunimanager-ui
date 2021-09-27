import { Button, Drawer, Form, Input, message, Radio, Select } from 'antd'
import styles from './index.module.less'
import { useExportCluster } from '@/api/cluster'
import { errToMsg } from '@/utils/error'
import { useMemo, useState } from 'react'
import { loadI18n, useI18n } from '@i18n-macro'
import { CodeInput } from '@/components/CodeEditor'
import { DatabaseapiDataExportReq } from '#/api'

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
  const [storageType, setStorageType] = useState<'nfs' | 's3'>('s3')
  const [httpProtocol, setHttpProtocol] = useState<'http://' | 'https://'>(
    'http://'
  )
  const [fileType, setFileType] = useState<'sql' | 'csv'>('csv')
  const [filterType, setFilterType] = useState<'sql' | 'db' | 'none'>('none')

  const formDom = useMemo(() => {
    async function onConfirm() {
      const value = (await form.validateFields()) as DatabaseapiDataExportReq
      if (value.filter && Array.isArray(value.filter)) {
        value.filter = value.filter.join(';')
      }
      if (value.endpointUrl) {
        if (!/^https?:\/\//.test(value.endpointUrl))
          value.endpointUrl = httpProtocol + value.endpointUrl
      }
      if (value.bucketUrl) {
        if (!/^s3:\/\//.test(value.bucketUrl))
          value.bucketUrl = 's3://' + value.bucketUrl
      }
      value.clusterId = clusterId
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
    const httpProtocolSelector = (
      <Select
        defaultValue="http://"
        className="select-before"
        onChange={(v) => setHttpProtocol(v)}
      >
        <Select.Option value="http://">http://</Select.Option>
        <Select.Option value="https://">https://</Select.Option>
      </Select>
    )
    const s3Options = (
      <>
        <Form.Item
          name="endpointUrl"
          label={t('form.s3.endpointUrl')}
          rules={[{ required: true }]}
        >
          <Input addonBefore={httpProtocolSelector} />
        </Form.Item>
        <Form.Item label={t('form.s3.bucket')}>
          <Form.Item name="bucketUrl" rules={[{ required: true }]} noStyle>
            <Input
              placeholder={t('form.s3.bucketUrl')}
              addonBefore="s3://"
              style={{ width: '70%' }}
            />
          </Form.Item>
          <Form.Item name="bucketRegion" noStyle>
            <Input
              placeholder={t('form.s3.bucketRegion')}
              style={{ width: '30%' }}
            />
          </Form.Item>
        </Form.Item>

        <Form.Item
          name="accessKey"
          label={t('form.s3.accessKey')}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="secretAccessKey"
          label={t('form.s3.secretAccessKey')}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
      </>
    )

    const localOptions = (
      <Form.Item
        name="filePath"
        label={t('form.nfs.filepath')}
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
    )

    const target = (
      <section>
        <h3>{t('form.target')}</h3>
        <Form.Item
          name="storageType"
          label={t('form.storageType')}
          initialValue="s3"
        >
          <Radio.Group onChange={(e) => setStorageType(e.target.value)}>
            <Radio value="s3">{t('storageType.s3')}</Radio>
            <Radio value="nfs">{t('storageType.nfs')}</Radio>
          </Radio.Group>
        </Form.Item>
        {storageType === 's3' ? s3Options : localOptions}
      </section>
    )

    const source = (
      <section>
        <h3>{t('form.source')}</h3>
        <Form.Item
          name="userName"
          label={t('form.username')}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="password" label={t('form.password')} initialValue="">
          <Input.Password />
        </Form.Item>
      </section>
    )

    const options = (
      <section>
        <h3>{t('form.options')}</h3>
        <Form.Item
          name="fileType"
          label={t('form.filetype')}
          initialValue="csv"
        >
          <Radio.Group
            onChange={(e) => {
              setFilterType('none')
              setFileType(e.target.value)
            }}
          >
            <Radio value="csv">{t('filetype.csv')}</Radio>
            <Radio value="sql">{t('filetype.sql')}</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item label={t('form.filterType')}>
          <Radio.Group
            onChange={(e) => {
              form.resetFields(['filter', 'sql'])
              setFilterType(e.target.value)
            }}
            value={filterType}
          >
            <Radio value="none">{t('filterType.none')}</Radio>
            <Radio value="db">{t('filterType.db')}</Radio>
            <Radio value="sql" disabled={fileType === 'sql'}>
              {t('filterType.sql')}
            </Radio>
          </Radio.Group>
        </Form.Item>
        {filterType === 'db' && (
          <Form.Item name="filter" label={' '} tooltip={t('tips.filter.db')}>
            <Select
              mode="tags"
              tokenSeparators={[';']}
              dropdownStyle={{ display: 'none' }}
            />
          </Form.Item>
        )}
        {filterType === 'sql' && (
          <Form.Item
            name="sql"
            className={styles.sqlEditor}
            label={' '}
            tooltip={t('tips.filter.sql')}
          >
            <CodeInput />
          </Form.Item>
        )}
      </section>
    )

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
        {target}
        {source}
        {options}
      </Form>
    )
  }, [
    storageType,
    fileType,
    filterType,
    httpProtocol,
    i18n.language,
    form,
    exportCluster.mutateAsync,
  ])

  return (
    <Drawer
      maskClosable={false}
      className={styles.drawer}
      title={t('title')}
      width={720}
      onClose={close}
      visible={visible}
      bodyStyle={{ paddingBottom: 80 }}
      destroyOnClose={true}
      footer={
        <Button
          className={styles.confirm}
          size="large"
          type="primary"
          onClick={() => form.submit()}
        >
          {t('form.submit')}
        </Button>
      }
    >
      {formDom}
    </Drawer>
  )
}
