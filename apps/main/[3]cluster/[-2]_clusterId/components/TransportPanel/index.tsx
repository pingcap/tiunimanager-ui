import { Button, Drawer, Form, Input, message, Radio, Select } from 'antd'
import styles from './index.module.less'
import { useExportCluster, useImportCluster } from '@/api/cluster'
import { errToMsg } from '@/utils/error'
import { useMemo } from 'react'
import { loadI18n, useI18n } from '@i18n-macro'
import { CodeInput } from '@/components/CodeEditor'
import { DatabaseapiDataExportReq, DatabaseapiDataImportReq } from '#/api'
import { useStateWithDefault } from '@hooks/useStateWithDefault'
import { TFunction } from 'react-i18next'

loadI18n()

export type TransportPanelProps = {
  clusterId: string
  visible: boolean
  close: () => void
}

export function ExportPanel({
  clusterId,
  visible,
  close,
}: TransportPanelProps) {
  const [form] = Form.useForm()
  const exportCluster = useExportCluster()
  const { t, i18n } = useI18n()
  const storageForm = useStorageForm({
    mode: 'export',
    t,
    lang: i18n.language,
  })
  const [fileType, setFileType, resetFileType] = useStateWithDefault<
    'sql' | 'csv'
  >('csv')
  const [filterType, setFilterType, resetFilterType] = useStateWithDefault<
    'sql' | 'db' | 'none'
  >('none')
  const onClose = () => {
    storageForm.reset()
    resetFileType()
    resetFilterType()
    close?.()
  }

  const formDom = useMemo(() => {
    async function onConfirm() {
      const value = (await form.validateFields()) as DatabaseapiDataExportReq
      storageForm.processValues(value)
      if (value.filter && Array.isArray(value.filter)) {
        value.filter = value.filter.join(';')
      }
      value.clusterId = clusterId
      await exportCluster.mutateAsync(
        {
          clusterId,
          ...value,
        },
        {
          onSuccess() {
            message.success(t('export.message.success'))
            close()
          },
          onError(e: any) {
            message.error(t('export.message.fail', { msg: errToMsg(e) }))
          },
        }
      )
    }

    const target = (
      <section>
        <h3>{t('export.target')}</h3>
        {storageForm.form}
      </section>
    )

    const source = (
      <section>
        <h3>{t('export.source')}</h3>
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
        <h3>{t('export.options')}</h3>
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
            <Radio value="csv">{t('enum.filetype.csv')}</Radio>
            <Radio value="sql">{t('enum.filetype.sql')}</Radio>
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
            <Radio value="none">{t('enum.filterType.none')}</Radio>
            <Radio value="db">{t('enum.filterType.db')}</Radio>
            <Radio value="sql" disabled={fileType === 'sql'}>
              {t('enum.filterType.sql')}
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
        name="export-panel"
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
    storageForm.form,
    fileType,
    filterType,
    i18n.language,
    form,
    exportCluster.mutateAsync,
  ])

  return (
    <Drawer
      maskClosable={false}
      className={styles.drawer}
      title={t('export.title')}
      width={720}
      onClose={onClose}
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

export function ImportPanel({
  clusterId,
  close,
  visible,
}: TransportPanelProps) {
  const [form] = Form.useForm()
  const importCluster = useImportCluster()
  const { t, i18n } = useI18n()
  const storageForm = useStorageForm({
    mode: 'import',
    t,
    lang: i18n.language,
  })
  const onClose = () => {
    storageForm.reset()
    close?.()
  }

  const formDom = useMemo(() => {
    async function onConfirm() {
      const value = (await form.validateFields()) as DatabaseapiDataImportReq
      storageForm.processValues(value)
      value.clusterId = clusterId
      await importCluster.mutateAsync(
        {
          clusterId,
          ...value,
        },
        {
          onSuccess() {
            message.success(t('import.message.success'))
            close()
          },
          onError(e: any) {
            message.error(t('import.message.fail', { msg: errToMsg(e) }))
          },
        }
      )
    }

    const source = (
      <section>
        <h3>{t('import.source')}</h3>
        {storageForm.form}
      </section>
    )

    const target = (
      <section>
        <h3>{t('import.target')}</h3>
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
        {source}
        {target}
      </Form>
    )
  }, [storageForm.form, i18n.language, form, importCluster.mutateAsync])

  return (
    <Drawer
      maskClosable={false}
      className={styles.drawer}
      title={t('import.title')}
      width={720}
      onClose={onClose}
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

type StorageFormProps = {
  t: TFunction<''>
  lang: string
  mode: 'import' | 'export'
}

function useStorageForm({ t, lang, mode }: StorageFormProps) {
  const [storageType, setStorageType, resetStorageType] = useStateWithDefault<
    'nfs' | 's3'
  >('s3')
  const [s3Protocol, setS3Protocol, resetS3Protocol] = useStateWithDefault<
    'http://' | 'https://'
  >('http://')
  const reset = () => {
    resetStorageType()
    resetS3Protocol()
  }
  const processValues = (value: DatabaseapiDataExportReq) => {
    if (value.endpointUrl) {
      if (!/^https?:\/\//.test(value.endpointUrl))
        value.endpointUrl = s3Protocol + value.endpointUrl
    }
    if (value.bucketUrl) {
      if (!/^s3:\/\//.test(value.bucketUrl))
        value.bucketUrl = 's3://' + value.bucketUrl
    }
  }
  const form = useMemo(() => {
    const httpProtocolSelector = (
      <Select
        defaultValue="http://"
        className="select-before"
        onChange={(v) => setS3Protocol(v)}
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
        {mode === 'export' ? (
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
        ) : (
          <Form.Item
            name="bucketUrl"
            label={t('form.s3.bucket')}
            rules={[{ required: true }]}
          >
            <Input addonBefore="s3://" />
          </Form.Item>
        )}

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

    return (
      <>
        <Form.Item
          name="storageType"
          label={t('form.storageType')}
          initialValue="s3"
        >
          <Radio.Group onChange={(e) => setStorageType(e.target.value)}>
            <Radio value="s3">{t('enum.storageType.s3')}</Radio>
            <Radio value="nfs">{t('enum.storageType.nfs')}</Radio>
          </Radio.Group>
        </Form.Item>
        {storageType === 's3' ? s3Options : localOptions}
      </>
    )
  }, [storageType, s3Protocol, lang])
  return {
    form,
    reset,
    processValues,
  }
}
