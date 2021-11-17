import {
  Button,
  Drawer,
  Form,
  Input,
  message,
  Radio,
  Select,
  Table,
  Tooltip,
  Upload,
  UploadProps,
} from 'antd'
import styles from './index.module.less'
import {
  useExportCluster,
  useImportCluster,
  useQueryTransportRecords,
} from '@/api/hooks/transport'
import { errToMsg } from '@/utils/error'
import { useMemo, useState } from 'react'
import { loadI18n, useI18n } from '@i18n-macro'
import { CodeInput } from '@/components/CodeEditor'
import {
  PagedResult,
  RequestTransportExport,
  TransportRecord,
} from '@/api/model'
import { useStateWithDefault } from '@hooks/useStateWithDefault'
import { UploadOutlined } from '@ant-design/icons'
import { getFsUploadURL } from '@/api/hooks/fs'
import { useAuthState } from '@store/auth'
import { usePagination } from '@hooks/usePagination'
import { formatTimeString } from '@/utils/time'

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

  const [targetType, setTargetType, resetTargetType] = useStateWithDefault<
    'nfs' | 's3'
  >('nfs')
  const [fileType, setFileType, resetFileType] = useStateWithDefault<
    'sql' | 'csv'
  >('csv')
  const [filterType, setFilterType, resetFilterType] = useStateWithDefault<
    'sql' | 'db' | 'none'
  >('none')

  const onClose = () => {
    resetTargetType()
    resetFileType()
    resetFilterType()
    close?.()
  }

  const { s3Options, processS3Options } = useS3Options()

  const targetOptions = useMemo(
    () => (
      <>
        <Form.Item
          name="storageType"
          label={t('form.storageType')}
          initialValue="nfs"
        >
          <Radio.Group onChange={(e) => setTargetType(e.target.value)}>
            <Radio value="nfs">{t('enum.storageType.nfs')}</Radio>
            <Radio value="s3">{t('enum.storageType.s3')}</Radio>
          </Radio.Group>
        </Form.Item>
        {targetType === 's3' ? (
          s3Options
        ) : (
          <Form.Item
            name="zipName"
            label={t('form.nfs.fileName')}
            tooltip={t('tips.nfs.fileName')}
          >
            <Input suffix=".zip" />
          </Form.Item>
        )}
      </>
    ),
    [targetType, i18n.language, s3Options]
  )

  const formDom = useMemo(() => {
    async function onConfirm() {
      const value = await form.validateFields()
      processS3Options(value)
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
            onClose()
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
        {targetOptions}
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
          <Form.Item
            name="filter"
            label={t('form.condition')}
            tooltip={t('tips.filter.db')}
          >
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
            label={t('form.condition')}
            tooltip={t('tips.filter.sql')}
          >
            <CodeInput />
          </Form.Item>
        )}
        <Form.Item name="comment" label={t('form.comment')}>
          <Input.TextArea />
        </Form.Item>
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
    targetOptions,
    processS3Options,
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
      bodyStyle={{ padding: 60, paddingTop: 20 }}
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
  const token = useAuthState((state) => state.token)
  const [form] = Form.useForm()
  const importCluster = useImportCluster()
  const { t, i18n } = useI18n()
  const [sourceType, setSourceType, resetSourceType] = useStateWithDefault<
    'local' | 'nfs' | 's3'
  >('local')
  const [uploaded, setUploaded] = useState(false)
  const [selectedImportable, setSelectedImportable] = useState<
    TransportRecord | undefined
  >(undefined)

  const clearSourceOptions = () => {
    setUploaded(false)
    setSelectedImportable(undefined)
  }

  const onClose = () => {
    resetSourceType()
    clearSourceOptions()
    close?.()
  }

  const submitEnabled =
    sourceType === 's3' ||
    (sourceType === 'nfs' && !!selectedImportable) ||
    (sourceType === 'local' && uploaded)

  const { importableRecords, isLoading, pagination, setPagination } =
    useImportableRecords(sourceType === 'nfs')

  const { s3Options, processS3Options } = useS3Options()

  const sourceOptions = useMemo(() => {
    const checkFileFormat: UploadProps['beforeUpload'] = (file) => {
      // see https://www.iana.org/assignments/media-types/media-types.xhtml
      if (file.type.includes('zip')) {
        setUploaded(false)
        return true
      }
      message.error(t('upload.error.format'))
      return Upload.LIST_IGNORE
    }

    const localOptions = (
      <Form.Item label={' '}>
        <Upload
          name="file"
          action={getFsUploadURL()}
          data={{
            clusterId,
          }}
          headers={{
            Authorization: `Bearer ${token}`,
          }}
          showUploadList={{
            showRemoveIcon: false,
          }}
          beforeUpload={checkFileFormat}
          maxCount={1}
          onChange={(info) => {
            switch (info.file.status) {
              case 'done':
                message.success(t('upload.status.success'), 2)
                setUploaded(true)
                return
              case 'error':
                message.error(
                  t('upload.status.fail', {
                    msg: info.file.response.message || 'unknown',
                  })
                )
                return
            }
          }}
        >
          <Button icon={<UploadOutlined />}>{t('upload.button')}</Button>
        </Upload>
      </Form.Item>
    )

    const nfsOptions = (
      <Table
        columns={[
          {
            title: t('importable.time'),
            width: 100,
            key: 'time',
            render: (_, record) => formatTimeString(record.startTime!),
          },
          {
            title: t('model:transport.property.clusterId'),
            width: 100,
            dataIndex: 'clusterId',
            key: 'clusterId',
            render: (_, record) => (
              <Tooltip placement="top" title={record.clusterId}>
                {record.clusterId}
              </Tooltip>
            ),
            ellipsis: {
              showTitle: false,
            },
          },
          {
            title: t('model:transport.property.comment'),
            width: 120,
            dataIndex: 'comment',
            key: 'comment',
            render: (_, record) => (
              <Tooltip placement="top" title={record.comment}>
                {record.comment}
              </Tooltip>
            ),
            ellipsis: {
              showTitle: false,
            },
          },
        ]}
        rowSelection={{
          type: 'radio',
          hideSelectAll: true,
          selectedRowKeys: selectedImportable
            ? [selectedImportable.recordId!]
            : [],
          onChange: (_, records) => {
            if (records.length) setSelectedImportable(records[0])
            else setSelectedImportable(undefined)
          },
        }}
        dataSource={importableRecords?.data.data?.transportRecords || []}
        loading={isLoading}
        pagination={{
          showSizeChanger: false,
          pageSize: pagination.pageSize,
          current: pagination.page,
          total: (importableRecords?.data as PagedResult)?.page?.total || 0,
          onChange(page) {
            setSelectedImportable(undefined)
            setPagination({ page, pageSize: pagination.pageSize })
          },
        }}
        rowKey="recordId"
        size="small"
      />
    )

    return (
      <>
        <Form.Item
          name="storageType"
          label={t('form.storageType')}
          initialValue="local"
        >
          <Radio.Group
            onChange={(e) => {
              setSourceType(e.target.value)
              clearSourceOptions()
            }}
          >
            <Radio value="local">{t('enum.storageType.local')}</Radio>
            <Radio value="nfs">{t('enum.storageType.nfs')}</Radio>
            <Radio value="s3">{t('enum.storageType.s3')}</Radio>
          </Radio.Group>
        </Form.Item>
        {sourceType === 'local'
          ? localOptions
          : sourceType === 's3'
          ? s3Options
          : nfsOptions}
      </>
    )
  }, [
    sourceType,
    i18n.language,
    s3Options,
    token,
    isLoading,
    importableRecords,
    selectedImportable,
  ])

  const formDom = useMemo(() => {
    async function onConfirm() {
      const value = await form.validateFields()
      processS3Options(value)
      value.clusterId = clusterId
      if (sourceType === 'nfs') value.recordId = selectedImportable!.recordId!
      if (sourceType === 'local') value.storageType = 'nfs'
      await importCluster.mutateAsync(
        {
          clusterId,
          ...value,
        },
        {
          onSuccess() {
            message.success(t('import.message.success'))
            onClose()
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
        {sourceOptions}
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
  }, [
    sourceOptions,
    i18n.language,
    form,
    importCluster.mutateAsync,
    sourceType,
    selectedImportable,
  ])

  return (
    <Drawer
      maskClosable={false}
      className={styles.drawer}
      title={t('import.title')}
      width={720}
      onClose={onClose}
      visible={visible}
      bodyStyle={{ padding: 60, paddingTop: 20 }}
      destroyOnClose={true}
      footer={
        <Button
          className={styles.confirm}
          size="large"
          type="primary"
          onClick={() => form.submit()}
          disabled={!submitEnabled}
        >
          {t('form.submit')}
        </Button>
      }
    >
      {formDom}
    </Drawer>
  )
}

function useImportableRecords(enabled: boolean) {
  const [pagination, setPagination] = usePagination(6)
  const { data, isLoading } = useQueryTransportRecords(
    { ...pagination, reImport: true },
    { keepPreviousData: true, enabled }
  )
  return {
    importableRecords: data,
    isLoading,
    pagination,
    setPagination,
  }
}

function useS3Options() {
  const { t, i18n } = useI18n()
  return useMemo(() => {
    const processS3Options = (
      value: RequestTransportExport & {
        endpointProtocol?: string
      }
    ) => {
      if (value.endpointUrl) {
        if (!/^https?:\/\//.test(value.endpointUrl))
          value.endpointUrl = value.endpointProtocol + value.endpointUrl
      }
      if (value.bucketUrl) {
        if (!/^s3:\/\//.test(value.bucketUrl))
          value.bucketUrl = 's3://' + value.bucketUrl
      }
      value.endpointProtocol = undefined
    }
    const s3Options = (
      <>
        <Form.Item
          name="endpointUrl"
          label={t('form.s3.endpointUrl')}
          rules={[{ required: true }]}
        >
          <Input
            addonBefore={
              <Form.Item
                name="endpointProtocol"
                rules={[{ required: true }]}
                noStyle
                initialValue="http://"
              >
                <Select className="select-before">
                  <Select.Option value="http://">http://</Select.Option>
                  <Select.Option value="https://">https://</Select.Option>
                </Select>
              </Form.Item>
            }
          />
        </Form.Item>
        <Form.Item
          name="bucketUrl"
          label={t('form.s3.bucket')}
          rules={[{ required: true }]}
        >
          <Input addonBefore="s3://" />
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
    return {
      s3Options,
      processS3Options,
    }
  }, [i18n.language])
}
