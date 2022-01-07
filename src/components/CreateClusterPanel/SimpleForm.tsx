import { FormInstance } from '@ant-design/pro-form'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { ClusterPreview, RequestClusterCreate } from '@/api/model'
import { loadI18n, useI18n } from '@i18n-macro'
import { TFunction, Trans } from 'react-i18next'
import {
  ComponentKnowledge,
  Knowledge,
  processCreateRequest,
  RegionKnowledge,
  useKnowledge,
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
import { ColumnsType } from 'antd/lib/table/interface'
import RadioCard from '@/components/RadioCard'
import AWSLogo from '/vendors/aws.svg'
import GCPLogo from '/vendors/gcp.svg'
import LocalLogo from '/vendors/local.svg'

loadI18n()

export interface SimpleFormProps {
  form: FormInstance

  additionalOptions?: ReactNode
  processValue?: (
    value: RequestClusterCreate,
    knowledge: Knowledge,
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
  const knowledge = useKnowledge()

  const [vendorId, setVendorId] = useState<string>()
  const [productId, setProductId] = useState<string>()
  const [productVersion, setProductVersion] = useState<string>()
  const [region, setRegion] = useState<string>()

  const setVendor = useCallback(
    (vendorId?: string) => {
      const currentVendorId = vendorId || knowledge._vendors[0]
      const defaultRegion = knowledge.vendors[currentVendorId]?._regions[0]
      setVendorId(currentVendorId)
      setRegion(defaultRegion)
      form.setFields([
        {
          name: 'vendorId',
          value: currentVendorId,
        },
        {
          name: 'region',
          value: defaultRegion,
        },
      ])
    },
    [knowledge, form]
  )

  const setProduct = useCallback(
    (productId?: string) => {
      const currentRegion =
        vendorId && region
          ? knowledge.vendors[vendorId]?.regions[region]
          : undefined
      const currentProduct =
        currentRegion?.products[productId || currentRegion?._products[0]]
      setProductId(currentProduct?.id)
      const defaultVersion = currentProduct?._versions[0]
      const defaultArch =
        defaultVersion && currentProduct?.versions[defaultVersion]?.archs[0]
      setProductVersion(defaultVersion)
      form.setFields([
        {
          name: 'clusterVersion',
          value: defaultVersion,
        },
        {
          name: 'cpuArchitecture',
          value: defaultArch,
        },
      ])
    },
    [knowledge, vendorId, region, form]
  )

  useEffect(() => {
    setVendor()
  }, [knowledge])

  useEffect(() => {
    setProduct()
  }, [knowledge, vendorId, region])

  const { t, i18n } = useI18n()

  const vendorSelector = useMemo(
    () => <VendorSelector selected={vendorId} onSelect={setVendor} />,
    [vendorId, setVendor]
  )

  const regionSelector = useMemo(() => {
    const regions = vendorId && knowledge?.vendors[vendorId]?.regions
    return (
      <RegionSelector
        regions={regions ? Object.values(regions) : []}
        selected={region}
        onSelect={(v) => setRegion(v)}
      />
    )
  }, [region, knowledge, vendorId])

  const basicOptions = useMemo(
    () =>
      !!productId &&
      !!productVersion &&
      !!vendorId &&
      !!region && (
        <BasicOptions
          t={t}
          onSelectProduct={setProduct}
          onSelectVersion={setProductVersion}
          onSelectRegion={setRegion}
          type={productId}
          version={productVersion}
          products={knowledge.vendors[vendorId]?.regions[region] || []}
        />
      ),
    [productId, productVersion, vendorId, region, knowledge, i18n.language]
  )

  const nodeOptions = useMemo(() => {
    const components =
      !!vendorId &&
      !!region &&
      !!productId &&
      !!productVersion &&
      knowledge.vendors[vendorId]?.regions[region]?.products[productId]
        ?.versions[productVersion]?.components
    return (
      !!components &&
      Object.values(components).map((comp, idx) => (
        <NodeOptions t={t} key={comp.id} idx={idx} component={comp} />
      ))
    )
  }, [
    productId,
    productVersion,
    region,
    vendorId,
    form,
    knowledge,
    i18n.language,
  ])

  const clusterOptions = useMemo(
    () => productId === 'TiDB' && <ClusterOptions />,
    [productId]
  )

  const onReset = useCallback(() => {
    form.resetFields()
    setProduct()
  }, [form, setProduct])

  const wrappedProcessValue: SimpleFormProps['processValue'] = (v, k, t) => {
    v.vendorId = vendorId
    v.region = region
    if (processValue) return processValue(v, k, t)
    return true
  }

  return (
    <>
      {vendorSelector}
      {regionSelector}
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
        {clusterOptions}
      </Form>
      <Submitter
        onSubmit={onSubmit}
        processValue={wrappedProcessValue}
        onReset={onReset}
        knowledge={knowledge}
        form={form}
        footerClassName={footerClassName}
        vendorId={vendorId}
        region={region}
        disableSubmit={!productId}
      />
    </>
  )
}

function BasicOptions({
  t,
  onSelectProduct,
  onSelectVersion,
  type,
  version,
  products,
}: {
  t: TFunction<''>
  onSelectProduct: (type: string) => void
  onSelectVersion: (version: string) => void
  onSelectRegion: (newRegion: string) => void
  type: string
  version: string
  products: RegionKnowledge
}) {
  return (
    <Card title={t('basic.title')}>
      <Form.Item
        label={t('basic.fields.type')}
        name="clusterType"
        rules={[{ required: true, message: t('basic.rules.type.require') }]}
        initialValue={type}
      >
        <Select onChange={(key) => onSelectProduct(key as any)}>
          {products._products?.map((id) => (
            <Select.Option value={id} key={id}>
              {products.products[id]?.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        label={t('basic.fields.version')}
        name="clusterVersion"
        rules={[{ required: true, message: t('basic.rules.version.require') }]}
        initialValue={version}
      >
        <Select onChange={(key) => onSelectVersion(key as string)}>
          {!!type &&
            products.products[type]?._versions?.map((v) => (
              <Select.Option value={v} key={v}>
                {products.products[type]?.versions[v]?.name}
              </Select.Option>
            ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="cpuArchitecture"
        label={t('basic.fields.arch')}
        rules={[{ required: true }]}
      >
        <Radio.Group>
          {!!type &&
            !!version &&
            products.products[type]?.versions[version]?.archs.map((a) => (
              <Radio.Button value={a} key={a}>
                {a}
              </Radio.Button>
            ))}
        </Radio.Group>
      </Form.Item>
    </Card>
  )
}

function NodeOptions({
  t,
  component,
  idx,
}: {
  t: TFunction<''>
  component: ComponentKnowledge
  idx: number
}) {
  return (
    <Collapse
      collapsible="header"
      defaultActiveKey={component.required ? ['1'] : []}
      className={styles.componentForm}
    >
      <Collapse.Panel
        key={1}
        header={
          <span>
            {t('nodes.title', {
              name: component.name,
            })}
            {!component.required && (
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
          initialValue={component.id}
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
        {component._zones.map((zoneCode, i) => {
          const zone = component.zones[zoneCode]
          if (!zone) return undefined
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
                  initialValue={zone._specs[0]}
                >
                  <Select>
                    {zone._specs.map((specCode) => {
                      const spec = zone.specs[specCode]
                      return (
                        <Select.Option key={specCode} value={specCode}>
                          {spec.id} ({spec.cpu}C {spec.memory}G)
                        </Select.Option>
                      )
                    })}
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
                  initialValue={component.required ? 3 : 0}
                >
                  <InputNumber
                    min={component.required ? component.minInstance : 0}
                    max={component.maxInstance}
                  />
                </Form.Item>
              </Col>
            </Row>
          )
        }) || <Empty description={t('message.noZone')} />}
      </Collapse.Panel>
    </Collapse>
  )
}

function ClusterOptions() {
  const { t } = useI18n()

  return (
    <Card title={t('cluster.title')}>
      <Form.Item
        name="clusterName"
        label={t('cluster.fields.name')}
        tooltip={t('cluster.tooltip.name')}
        rules={[
          { required: true, message: t('cluster.rules.name.require') },
          { min: 8, max: 32, message: t('cluster.rules.name.length') },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="tags"
        label={t('cluster.fields.tags')}
        tooltip={t('cluster.tooltip.tags')}
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
        label={t('cluster.fields.password')}
        tooltip={t('cluster.tooltip.password')}
        rules={[
          { required: true, message: t('cluster.rules.password.require') },
          { min: 8, max: 32, message: t('cluster.rules.password.length') },
        ]}
      >
        <Input.Password />
      </Form.Item>
      <Form.Item
        name="exclusive"
        label={t('cluster.fields.exclusive')}
        initialValue={true}
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>
    </Card>
  )
}

function Submitter({
  onReset,
  onSubmit,
  footerClassName,
  knowledge,
  processValue,
  form,
  disableSubmit,
  region,
  vendorId,
}: {
  onReset: () => unknown
  processValue?: SimpleFormProps['processValue']
  onSubmit: (data: RequestClusterCreate) => unknown
  footerClassName?: string
  knowledge: Knowledge
  form: FormInstance
  disableSubmit: boolean
  region?: string
  vendorId?: string
}) {
  const { t, i18n } = useI18n()
  const previewCreateCluster = usePreviewCreateCluster()

  const columns = useMemo(() => getColumns(t), [i18n.language])

  const handleSubmit = async () => {
    try {
      const fields = await form.validateFields()
      fields.vendorId = vendorId
      fields.region = region
      if (
        processCreateRequest(fields, knowledge, t) &&
        (!processValue || processValue(fields, knowledge, t))
      ) {
        await previewCreateCluster.mutateAsync(
          {
            payload: fields,
            options: {
              actionName: t('preview.name'),
              skipSuccessNotification: true,
            },
          },
          {
            onSuccess(resp) {
              const {
                clusterName,
                clusterType,
                clusterVersion,
                region,
                cpuArchitecture,
                stockCheckResult,
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
                    {fields.backupId && (
                      <p>
                        <Trans
                          t={t}
                          i18nKey="preview.restoreInfo"
                          values={{
                            backupId: fields.backupId,
                            clusterId: fields.clusterId,
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
          }
        )
      }
    } catch (e) {
      // NO_OP
    }
  }

  return (
    <div className={`${styles.submitter} ${footerClassName || ''}`}>
      <IntlPopConfirm title={t('footer.reset.confirm')} onConfirm={onReset}>
        <Button size="large">{t('footer.reset.title')}</Button>
      </IntlPopConfirm>
      <Button
        size="large"
        type="primary"
        onClick={handleSubmit}
        disabled={disableSubmit}
      >
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

type VendorSelectorProps = {
  selected?: string
  onSelect: (vendor: string) => unknown
}

function VendorSelector({ selected, onSelect }: VendorSelectorProps) {
  const { t } = useI18n()
  // FIXME: vendors should be generated from real data, so should logo urls.

  return (
    <div className={styles.standardSelector}>
      <Card
        title={t('vendorSelector.title')}
        bodyStyle={{
          display: 'flex',
          justifyContent: 'space-around',
        }}
      >
        <RadioCard
          checked={selected === 'local'}
          cover={LocalLogo}
          onClick={() => {
            if (selected === 'local') return
            onSelect('local')
          }}
          tooltip={t('vendorSelector.vendors.local')}
        />
        <RadioCard
          checked={selected === 'AWS'}
          cover={AWSLogo}
          onClick={() => {
            if (selected === 'AWS') return
            onSelect('AWS')
          }}
          tooltip={t('vendorSelector.vendors.aws')}
        />
        <RadioCard
          checked={selected === 'GCP'}
          cover={GCPLogo}
          onClick={() => {
            if (selected === 'GCP') return
            onSelect('GCP')
          }}
          tooltip={t('vendorSelector.vendors.gcp')}
        />
      </Card>
    </div>
  )
}

type RegionSelectorProps = {
  regions: RegionKnowledge[]
  selected?: string
  onSelect: (region: string) => unknown
}

function RegionSelector({ regions, selected, onSelect }: RegionSelectorProps) {
  const { t } = useI18n()

  return (
    <div className={styles.standardSelector}>
      <Card
        title={t('regionSelector.title')}
        bodyStyle={{
          display: 'flex',
          justifyContent: 'space-around',
        }}
      >
        <Select onChange={onSelect} value={selected} style={{ width: '100%' }}>
          {regions.map((r) => (
            <Select.Option value={r.id} key={r.id}>
              {r.name}
            </Select.Option>
          ))}
        </Select>
      </Card>
    </div>
  )
}
