import { FormInstance } from '@ant-design/pro-form'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import {
  ClusterPreview,
  HardwareArch,
  KnowledgeOfClusterComponent,
  RequestClusterCreate,
} from '@/api/model'
import { loadI18n, useI18n } from '@i18n-macro'
import { TFunction, Trans } from 'react-i18next'
import {
  AvailableStocksMap,
  KnowledgeMap,
  processCreateRequest,
  useAvailableStocks,
  useKnowledgeMap,
} from '@/components/CreateClusterPanel/helpers'
import {
  Button,
  Card,
  Col,
  Collapse,
  Divider,
  Empty,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Radio,
  Row,
  Select,
  Switch,
  Table,
  Tag,
} from 'antd'
import styles from '@/components/CreateClusterPanel/index.module.less'
import IntlPopConfirm from '../IntlPopConfirm'
import { usePreviewCreateCluster } from '@/api/hooks/cluster'
import { errToMsg } from '@/utils/error'
import { ColumnsType } from 'antd/lib/table/interface'

loadI18n()

export interface SimpleFormProps {
  form: FormInstance

  additionalOptions?: ReactNode
  processValue?: (
    value: RequestClusterCreate,
    knowledgeMap: KnowledgeMap,
    t: TFunction<''>
  ) => boolean

  formClassName?: string
  onSubmit: (data: RequestClusterCreate) => void
  footerClassName?: string
}

export function SimpleForm({
  form,
  additionalOptions,
  processValue,
  formClassName,
  onSubmit,
  footerClassName,
}: SimpleFormProps) {
  const knowledgeMap = useKnowledgeMap()

  const [clusterType, setClusterType] = useState<string>()
  const [clusterVersion, setClusterVersion] = useState<string>()
  const [arch, setArch] = useState<HardwareArch>(HardwareArch.x86_64)
  const [region, setRegion] = useState<string | undefined>()

  const availableStocksMap = useAvailableStocks(arch)

  // TODO: reset arch and region after select cluster type

  const setDefaultTypeAndVersion = useCallback(
    (clusterType?: string) => {
      const defaultClusterType = clusterType || knowledgeMap.types[0]?.code
      if (defaultClusterType) {
        setClusterType(defaultClusterType)
        const defaultVersion =
          knowledgeMap.map[defaultClusterType].versions[0].code
        setClusterVersion(defaultVersion)
        form.setFields([
          {
            name: 'clusterVersion',
            value: defaultVersion,
          },
        ])
      }
    },
    [knowledgeMap, form]
  )

  const resetArch = () => {
    setArch(HardwareArch.x86_64)
    form.setFields([{ name: 'cpuArchitecture', value: HardwareArch.x86_64 }])
  }
  const resetRegion = () => {
    setRegion(undefined)
    form.setFields([{ name: 'region', value: undefined }])
  }

  useEffect(() => {
    setDefaultTypeAndVersion()
  }, [setDefaultTypeAndVersion])

  const { t, i18n } = useI18n()

  const basicOptions = useMemo(
    () =>
      !!clusterType &&
      !!clusterVersion && (
        <BasicOptions
          t={t}
          onSelectType={setDefaultTypeAndVersion}
          onSelectVersion={setClusterVersion}
          onSelectArch={(newArch) => {
            setArch(newArch)
            resetRegion()
          }}
          onSelectRegion={setRegion}
          type={clusterType}
          version={clusterVersion}
          region={region}
          knowledgeMap={knowledgeMap}
          availableStocksMap={availableStocksMap}
        />
      ),
    [
      clusterType,
      clusterVersion,
      region,
      knowledgeMap,
      availableStocksMap,
      i18n.language,
    ]
  )

  const nodeOptions = useMemo(
    () =>
      knowledgeMap.map?.[clusterType!]?.map?.[clusterVersion!]?.components.map(
        (spec, idx) => (
          <NodeOptions
            t={t}
            key={spec.clusterComponent!.componentType!}
            idx={idx}
            spec={spec}
            region={region}
            availableStocksMap={availableStocksMap}
          />
        )
      ),
    [
      clusterType,
      clusterVersion,
      region,
      form,
      availableStocksMap,
      knowledgeMap,
      i18n.language,
    ]
  )

  const onReset = useCallback(() => {
    form.resetFields()
    setDefaultTypeAndVersion()
    resetArch()
    resetRegion()
  }, [form, setDefaultTypeAndVersion])

  return (
    <>
      <Form
        layout="horizontal"
        hideRequiredMark
        colon={false}
        form={form}
        name="create"
        className={`${styles.form} ${styles.simpleForm} ${formClassName || ''}`}
      >
        <Row>{additionalOptions}</Row>
        <Row>{basicOptions}</Row>
        {nodeOptions}
      </Form>
      <Submitter
        onSubmit={onSubmit}
        processValue={processValue}
        onReset={onReset}
        knowledgeMap={knowledgeMap}
        form={form}
        footerClassName={footerClassName}
      />
    </>
  )
}

function BasicOptions({
  t,
  onSelectType,
  onSelectVersion,
  onSelectArch,
  onSelectRegion,
  type,
  version,
  region,
  knowledgeMap,
  availableStocksMap,
}: {
  t: TFunction<''>
  onSelectType: (type: string) => void
  onSelectVersion: (version: string) => void
  onSelectArch: (arch: HardwareArch) => void
  onSelectRegion: (newRegion: string) => void
  type: string
  version: string
  region?: string
  knowledgeMap: KnowledgeMap
  availableStocksMap: AvailableStocksMap
}) {
  return (
    <Card title={t('basic.title')}>
      <Form.Item
        name="clusterName"
        label={t('basic.fields.name')}
        tooltip={t('basic.tooltip.name')}
        rules={[
          { required: true, message: t('basic.rules.name.require') },
          { min: 8, max: 32, message: t('basic.rules.name.length') },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="tags"
        label={t('basic.fields.tags')}
        tooltip={t('basic.tooltip.tags')}
        initialValue={[]}
      >
        <Select
          mode="tags"
          tokenSeparators={[',', ' ']}
          dropdownStyle={{ display: 'none' }}
        />
      </Form.Item>
      <Form.Item
        name="dbPassword"
        label={t('basic.fields.password')}
        tooltip={t('basic.tooltip.password')}
        rules={[
          { required: true, message: t('basic.rules.password.require') },
          { min: 8, max: 32, message: t('basic.rules.password.length') },
        ]}
      >
        <Input.Password />
      </Form.Item>
      <Form.Item label={t('basic.fields.type')}>
        <Input.Group compact>
          <Form.Item
            name="clusterType"
            noStyle
            rules={[{ required: true, message: t('basic.rules.type.require') }]}
            initialValue={type}
          >
            <Select onSelect={(key) => onSelectType(key as any)}>
              {knowledgeMap.types.map((t) => (
                <Select.Option value={t.code!} key={t.code!}>
                  {t.name!}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="clusterVersion"
            noStyle
            rules={[
              { required: true, message: t('basic.rules.version.require') },
            ]}
            initialValue={version}
          >
            <Select onSelect={(key) => onSelectVersion(key as string)}>
              {!!type &&
                knowledgeMap.map[type].versions.map((v) => (
                  <Select.Option value={v.code!} key={v.code!}>
                    {v.name!}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
        </Input.Group>
      </Form.Item>
      <Form.Item
        name="cpuArchitecture"
        label={t('basic.fields.arch')}
        rules={[{ required: true }]}
        initialValue={HardwareArch.x86_64}
      >
        <Radio.Group onChange={(v) => onSelectArch(v.target.value)}>
          <Radio.Button value={HardwareArch.x86_64}>x86_64</Radio.Button>
          <Radio.Button value={HardwareArch.x86}>x86</Radio.Button>
          <Radio.Button value={HardwareArch.arm64}>arm64</Radio.Button>
          <Radio.Button value={HardwareArch.arm}>arm</Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item
        name="region"
        label={t('basic.fields.region')}
        rules={[{ required: true }]}
        initialValue={region}
      >
        <Select onChange={onSelectRegion}>
          {availableStocksMap.regions.map((r) => (
            <Select.Option value={r} key={r}>
              {availableStocksMap.map[r].name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="exclusive"
        label={t('basic.fields.exclusive')}
        initialValue={true}
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>
      {/* TODO: wait for TLS support */}
      {/* <Form.Item
        name="tls"
        label={t('basic.fields.tls')}
        valuePropName="checked"
        initialValue={false}
      >
        <Switch />
      </Form.Item> */}
    </Card>
  )
}

function NodeOptions({
  t,
  spec,
  idx,
  region,
  availableStocksMap,
}: {
  t: TFunction<''>
  spec: KnowledgeOfClusterComponent
  idx: number
  region?: string
  availableStocksMap: AvailableStocksMap
}) {
  const componentName = spec.clusterComponent!.componentName!
  const componentType = spec.clusterComponent!.componentType!
  const componentRequired = spec.componentConstraint!.componentRequired
  const suggestedNodeQuantity = componentRequired
    ? spec.componentConstraint!.suggestedNodeQuantities?.[0] || 1
    : 0
  const specCodes = spec.componentConstraint!.availableSpecCodes!
  const currentRegion = region ? availableStocksMap.map[region] : undefined
  return (
    <Collapse
      collapsible="header"
      defaultActiveKey={componentRequired ? ['1'] : []}
      className={styles.componentForm}
    >
      <Collapse.Panel
        key={1}
        header={
          <span>
            {t('nodes.title', {
              name: componentName,
            })}
            {!componentRequired && (
              <Tag color="default" className={styles.optionalBadge}>
                {t('nodes.optional')}
              </Tag>
            )}
          </span>
        }
      >
        <Form.Item
          name={[
            'resourceParameters',
            'instanceResource',
            idx,
            'componentType',
          ]}
          hidden
          initialValue={componentType}
        >
          <Input />
        </Form.Item>
        <Row
          gutter={20}
          style={{
            lineHeight: '12px',
            fontSize: 16,
          }}
        >
          <Col span={8}>{t('nodes.fields.zone')}</Col>
          <Col span={8}>{t('nodes.fields.spec')}</Col>
          <Col span={8}>{t('nodes.fields.amount')}</Col>
        </Row>
        <Divider style={{ margin: '16px 0' }} />
        {currentRegion?.zones.map((zoneCode, i) => {
          const zone = currentRegion.map[zoneCode]
          if (specCodes.length === 0) return undefined
          return (
            <Row key={i} gutter={20}>
              <Col span={8}>
                <Form.Item
                  name={[
                    'resourceParameters',
                    'instanceResource',
                    idx,
                    'resource',
                    i,
                    'zoneCode',
                  ]}
                  initialValue={zoneCode}
                  hidden
                >
                  <Input />
                </Form.Item>
                <div className={styles.zoneName}>{zone.name}</div>
              </Col>
              <Col span={8}>
                <Form.Item
                  name={[
                    'resourceParameters',
                    'instanceResource',
                    idx,
                    'resource',
                    i,
                    'specCode',
                  ]}
                  initialValue={specCodes[0]}
                >
                  <Select>
                    {specCodes.map((spec) => (
                      <Select.Option key={spec} value={spec}>
                        {spec}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name={[
                    'resourceParameters',
                    'instanceResource',
                    idx,
                    'resource',
                    i,
                    'count',
                  ]}
                  initialValue={suggestedNodeQuantity}
                >
                  <InputNumber
                    min={0}
                    // TODO: add max limit
                  />
                </Form.Item>
              </Col>
            </Row>
          )
        }) || <Empty description={t('message.needRegion')} />}
      </Collapse.Panel>
    </Collapse>
  )
}

function Submitter({
  onReset,
  onSubmit,
  footerClassName,
  knowledgeMap,
  processValue,
  form,
}: {
  onReset: () => unknown
  processValue?: SimpleFormProps['processValue']
  onSubmit: (data: RequestClusterCreate) => unknown
  footerClassName?: string
  knowledgeMap: KnowledgeMap
  form: FormInstance
}) {
  const { t, i18n } = useI18n()
  const previewCreateCluster = usePreviewCreateCluster()

  const columns = useMemo(() => getColumns(t), [i18n.language])

  const handleSubmit = async () => {
    try {
      const fields = await form.validateFields()
      if (
        processCreateRequest(fields, knowledgeMap, t) &&
        (!processValue || processValue(fields, knowledgeMap, t))
      ) {
        await previewCreateCluster.mutateAsync(fields, {
          onSuccess(resp) {
            const {
              clusterName,
              clusterType,
              clusterVersion,
              region,
              cpuArchitecture,
              stockCheckResult,
              recoverInfo,
            } = resp.data!.data!
            const data = stockCheckResult!.map((r, id) => ({
              id,
              ...r,
            }))
            const isSubmittable = !data.find((r) => !r.enough)
            Modal.confirm({
              icon: <></>,
              width: 800,
              okButtonProps: {
                disabled: !isSubmittable,
              },
              okText: t('preview.actions.confirm'),
              content: (
                <div>
                  <p>
                    <Trans
                      t={t}
                      i18nKey="preview.description"
                      values={{
                        arch: cpuArchitecture,
                        name: clusterName,
                        version: clusterVersion,
                        type: clusterType,
                        region,
                      }}
                      components={{ strong: <strong /> }}
                    />
                  </p>
                  {recoverInfo && fields.recoverInfo && (
                    <p>
                      <Trans
                        t={t}
                        i18nKey="preview.restoreInfo"
                        values={{
                          backupId: recoverInfo.backupRecordId,
                          clusterId: recoverInfo.sourceClusterId,
                        }}
                        components={{ strong: <strong /> }}
                      />
                    </p>
                  )}
                  <Table
                    size="small"
                    columns={columns}
                    dataSource={data}
                    rowKey="id"
                    pagination={false}
                  />
                </div>
              ),
              onOk() {
                onSubmit(fields)
              },
            })
          },
          onError(e: any) {
            message.error(
              t('message.fail', {
                msg: errToMsg(e),
              })
            )
          },
        })
      }
    } catch (e) {
      // TODO: show err message
    }
  }

  return (
    <div className={`${styles.submitter} ${footerClassName || ''}`}>
      <IntlPopConfirm title={t('footer.reset.confirm')} onConfirm={onReset}>
        <Button size="large">{t('footer.reset.title')}</Button>
      </IntlPopConfirm>
      <Button size="large" type="primary" onClick={handleSubmit}>
        {t('footer.submit.title')}
      </Button>
    </div>
  )
}

function getColumns(
  t: TFunction<''>
): ColumnsType<Exclude<ClusterPreview['stockCheckResult'], undefined>[number]> {
  return [
    {
      title: t('preview.columns.component'),
      width: 80,
      dataIndex: 'componentName',
      key: 'type',
    },
    {
      title: t('preview.columns.zone'),
      width: 80,
      dataIndex: 'zoneCode',
      key: 'zone',
    },
    {
      title: t('preview.columns.spec'),
      width: 80,
      dataIndex: 'specCode',
      key: 'spec',
    },
    {
      title: t('preview.columns.amount'),
      width: 60,
      dataIndex: 'count',
      key: 'amount',
    },
    {
      title: t('preview.columns.status'),
      width: 140,
      key: 'status',
      render: (_, record) =>
        record.enough ? (
          t('preview.status.normal')
        ) : (
          <span style={{ color: 'red' }}>{t('preview.status.notEnough')}</span>
        ),
    },
  ]
}
