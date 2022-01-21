import { FormInstance } from '@ant-design/pro-form'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { ClusterPreview, RequestClusterCreate } from '@/api/model'
import { loadI18n, useI18n } from '@i18n-macro'
import { TFunction, Trans } from 'react-i18next'
import {
  ComponentKnowledge,
  processCreateRequest,
  ProductsKnowledge,
  RegionKnowledge,
  useComponents,
  useProducts,
  useVendorsAndRegions,
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

loadI18n()

export interface SimpleFormProps {
  form: FormInstance

  additionalOptions?: ReactNode
  processValue?: (
    value: RequestClusterCreate,
    componentsKnowledge: ComponentKnowledge[],
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
  const [vendorId, setVendorId] = useState<string>()
  const [productId, setProductId] = useState<string>()
  const [productVersion, setProductVersion] = useState<string>()
  const [region, setRegion] = useState<string>()
  const [arch, setArch] = useState<string>()

  const vendorAndRegions = useVendorsAndRegions()
  const products = useProducts(vendorId, region)
  const components = useComponents(
    vendorId,
    region,
    productId,
    productVersion,
    arch
  )

  const setVendor = useCallback(
    (vendorId?: string) => {
      if (!vendorAndRegions) return
      const currentVendorId = vendorId || vendorAndRegions._vendors[0]
      const defaultRegion =
        vendorAndRegions.vendors[currentVendorId]?._regions[0]
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
    [vendorAndRegions, form]
  )

  const setProduct = useCallback(
    (productId?: string) => {
      if (!products) return
      const currentProduct =
        products.products[productId || products._products[0]]
      setProductId(currentProduct?.id)
      const defaultArch = currentProduct?._archs[0]
      const defaultVersion =
        defaultArch && currentProduct?.archs[defaultArch]?.versions[0]
      setProductVersion(defaultVersion)
      setArch(defaultArch)
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
    [products, form]
  )

  useEffect(() => {
    setVendor()
  }, [vendorAndRegions])

  useEffect(() => {
    setProduct()
  }, [products])

  const { t, i18n } = useI18n()

  const vendorSelector = useMemo(
    () =>
      vendorAndRegions && (
        <VendorSelector
          vendors={vendorAndRegions._vendors}
          selected={vendorId}
          onSelect={setVendor}
        />
      ),
    [vendorId, setVendor, vendorAndRegions]
  )

  const regionSelector = useMemo(() => {
    const regions = vendorId && vendorAndRegions?.vendors?.[vendorId]?.regions
    return (
      regions && (
        <RegionSelector
          regions={regions ? Object.values(regions) : []}
          selected={region}
          onSelect={(v) => setRegion(v)}
        />
      )
    )
  }, [region, vendorAndRegions, vendorId])

  const basicOptions = useMemo(
    () =>
      !!productId &&
      !!arch &&
      !!vendorId &&
      !!region && (
        <BasicOptions
          t={t}
          onSelectProduct={setProduct}
          onSelectVersion={setProductVersion}
          onSelectRegion={setRegion}
          onSelectArch={setArch}
          type={productId}
          arch={arch}
          products={products}
        />
      ),
    [productId, arch, vendorId, region, products, i18n.language]
  )

  const nodeOptions = useMemo(
    () =>
      components?.map((comp, idx) => (
        <ComponentOptions t={t} key={comp.id} idx={idx} component={comp} />
      )),
    [form, components, i18n.language]
  )

  const clusterOptions = useMemo(
    () => productId === 'TiDB' && <ClusterOptions />,
    [productId]
  )

  const onReset = useCallback(() => {
    form.resetFields()
    setProduct()
  }, [form, setProduct])

  const wrappedProcessValue: SimpleFormProps['processValue'] = (v, k, t) => {
    v.vendor = vendorId!
    v.region = region!
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
        componentsKnowledge={components}
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
  onSelectArch,
  type,
  arch,
  products,
}: {
  t: TFunction<''>
  onSelectProduct: (type: string) => void
  onSelectVersion: (version: string) => void
  onSelectRegion: (newRegion: string) => void
  onSelectArch: (newArch: string) => void
  type: string
  arch: string
  products: ProductsKnowledge
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
              {products.products[id]?.id}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        label={t('basic.fields.version')}
        name="clusterVersion"
        rules={[{ required: true, message: t('basic.rules.version.require') }]}
      >
        <Select onChange={(key) => onSelectVersion(key as string)}>
          {!!type &&
            !!arch &&
            products.products[type]?.archs[arch]?.versions.map((v) => (
              <Select.Option value={v} key={v}>
                {v}
              </Select.Option>
            ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="cpuArchitecture"
        label={t('basic.fields.arch')}
        rules={[{ required: true }]}
        initialValue={arch}
      >
        <Radio.Group onChange={(e) => onSelectArch(e.target.value)}>
          {!!type &&
            products.products[type]?._archs.map((a) => (
              <Radio.Button value={a} key={a}>
                {a}
              </Radio.Button>
            ))}
        </Radio.Group>
      </Form.Item>
    </Card>
  )
}

function ComponentOptions({
  t,
  component,
  idx,
}: {
  t: TFunction<''>
  component: ComponentKnowledge
  idx: number
}) {
  const required = component.minInstance > 0
  return (
    <Collapse
      collapsible="header"
      defaultActiveKey={required ? ['1'] : []}
      className={styles.componentForm}
    >
      <Collapse.Panel
        key={1}
        header={
          <span>
            {t('component.title', {
              name: component.name,
            })}
            {!required && (
              <Tag color="default" className={styles.optionalBadge}>
                {t('component.optional')}
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
        {/* FIXME: remove hard-coded copies options for tikv */}
        {component.id === 'TiKV' && (
          <Form.Item
            name="copies"
            initialValue={3}
            label={t('component.fields.copies')}
          >
            <Select>
              {[1, 2, 3, 4, 5].map((count) => (
                <Select.Option key={count} value={count}>
                  {count}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}
        <Row
          gutter={20}
          style={{
            lineHeight: '12px',
            fontSize: 16,
          }}
        >
          <Col span={8}>{t('component.fields.zone')}</Col>
          <Col span={8}>{t('component.fields.spec')}</Col>
          <Col span={8}>{t('component.fields.amount')}</Col>
        </Row>
        <Divider style={{ margin: '16px 0' }} />
        {component.zones.map((zone, i) => {
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
                  initialValue={zone.id}
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
                  // FIXME: remove spec rewrite
                  initialValue={
                    zone.specs[0] &&
                    `${zone.specs[0].cpu}C${zone.specs[0].memory}G`
                  }
                >
                  <Select>
                    {zone.specs.map((spec) => (
                      <Select.Option
                        key={spec.id}
                        // FIXME: remove spec rewrite
                        value={`${spec.cpu}C${spec.memory}G`}
                      >
                        {spec.id} ({spec.cpu}C {spec.memory}G)
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
                  initialValue={required ? 3 : 0}
                >
                  <InputNumber min={0} max={component.maxInstance} />
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
  componentsKnowledge,
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
  componentsKnowledge: ComponentKnowledge[]
  form: FormInstance
  disableSubmit: boolean
  region?: string
  vendorId?: string
}) {
  const { t, i18n } = useI18n()
  const previewCreateCluster = usePreviewCreateCluster()

  const columns = useMemo(() => getColumns(t), [i18n.language])

  const [loadingPreview, setLoadingPreview] = useState(false)

  const handleSubmit = async () => {
    try {
      const fields = await form.validateFields()
      fields.vendor = vendorId
      fields.region = region
      if (
        processCreateRequest(fields, componentsKnowledge, t) &&
        (!processValue || processValue(fields, componentsKnowledge, t))
      ) {
        setLoadingPreview(true)
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
            onSettled() {
              setLoadingPreview(false)
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
        loading={loadingPreview}
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
  vendors: string[]
  selected?: string
  onSelect: (vendor: string) => unknown
}

function VendorSelector({ selected, onSelect, vendors }: VendorSelectorProps) {
  const { t } = useI18n()

  return (
    <div className={styles.standardSelector}>
      <Card
        title={t('vendorSelector.title')}
        bodyStyle={{
          display: 'flex',
          justifyContent: 'space-around',
        }}
      >
        <Select onChange={onSelect} value={selected} style={{ width: '100%' }}>
          {vendors.map((vendorId) => (
            <Select.Option value={vendorId} key={vendorId}>
              {t(`vendorSelector.vendors.${vendorId.toLowerCase()}`)}
            </Select.Option>
          ))}
        </Select>
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
