import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { TFunction, Trans } from 'react-i18next'
import {
  Button,
  Card,
  Cascader,
  Col,
  Collapse,
  Divider,
  Dropdown,
  Empty,
  Form,
  Input,
  InputNumber,
  Menu,
  Modal,
  Radio,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  TableColumnsType,
} from 'antd'
import { FormInstance } from '@ant-design/pro-form'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { loadI18n, useI18n } from '@i18n-macro'
import { ClusterPreview, RequestClusterCreate } from '@/api/model'
import { usePreviewCreateCluster } from '@/api/hooks/cluster'
import { isNumber } from '@/utils/types'
import IntlPopConfirm from '../IntlPopConfirm'
import {
  ComponentKnowledge,
  processCreateRequest,
  ProductsKnowledge,
  RegionKnowledge,
  useComponents,
  useHostOptions,
  useParamGroups,
  useProducts,
  useVendorsAndRegions,
} from './helpers'

import styles from './index.module.less'

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
  const [allocationType, setAllocationType] = useState<string>('SpecificZone')

  const vendorAndRegions = useVendorsAndRegions()
  const products = useProducts(vendorId, region)
  const components = useComponents(
    vendorId,
    region,
    productId,
    productVersion,
    arch
  )

  // Get parameter groups with productId, productVersion
  const { paramGroups } = useParamGroups(productId, productVersion)

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

  // set a default value of the parameterGroupID item
  useEffect(() => {
    if (paramGroups?.length) {
      form.setFieldsValue({
        parameterGroupID: paramGroups[0].id,
      })
    }
  }, [paramGroups, form])

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
          onSelectArch={setArch}
          onSelectAllocationType={setAllocationType}
          type={productId}
          arch={arch}
          products={products}
          paramGroups={paramGroups}
        />
      ),
    [productId, arch, vendorId, region, products, paramGroups, i18n.language]
  )

  const nodeOptionsForZone = useMemo(
    () =>
      components?.map((comp, idx) => (
        <ComponentOptionsForZone
          t={t}
          key={comp.id}
          idx={idx}
          component={comp}
        />
      )),
    [components, i18n.language]
  )

  const nodeOptionsForHost = useMemo(
    () =>
      components?.map((comp, idx) => (
        <ComponentOptionsForHost
          key={comp.id}
          form={form}
          idx={idx}
          component={comp}
          region={region}
          arch={arch}
        />
      )),
    [form, components, region, arch]
  )

  const nodeOptions = useMemo(
    () => (
      <Form.Item<RequestClusterCreate>
        noStyle
        shouldUpdate={(prevValues, currentValues) =>
          prevValues.resourceParameters?.requestResourceMode !==
          currentValues.resourceParameters?.requestResourceMode
        }
      >
        {(form) => {
          const allocationType: string = form.getFieldValue([
            'resourceParameters',
            'requestResourceMode',
          ])

          return allocationType === 'SpecificHost'
            ? nodeOptionsForHost
            : nodeOptionsForZone
        }}
      </Form.Item>
    ),
    [nodeOptionsForZone, nodeOptionsForHost]
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
        scrollToFirstError
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
        allocationType={allocationType}
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
  onSelectAllocationType,
  type,
  arch,
  products,
  paramGroups,
}: {
  t: TFunction<''>
  onSelectProduct: (type: string) => void
  onSelectVersion: (version: string) => void
  onSelectArch: (newArch: string) => void
  onSelectAllocationType: (allocationType: string) => void
  type: string
  arch: string
  products: ProductsKnowledge
  paramGroups: { id: string; name: string }[]
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
        label={t('basic.fields.paramGroup')}
        name="parameterGroupID"
        rules={[
          { required: true, message: t('basic.rules.paramGroup.require') },
        ]}
      >
        <Select>
          {paramGroups.map((item) => (
            <Select.Option value={item.id} key={item.id}>
              {item.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name={['resourceParameters', 'requestResourceMode']}
        label={t('basic.fields.allocation')}
        rules={[{ required: true }]}
        initialValue="SpecificZone"
      >
        <Radio.Group onChange={(e) => onSelectAllocationType(e.target.value)}>
          <Radio.Button value="SpecificZone" key="zone">
            {t('allocation.zone')}
          </Radio.Button>
          <Radio.Button value="SpecificHost" key="host">
            {t('allocation.host')}
          </Radio.Button>
        </Radio.Group>
      </Form.Item>
    </Card>
  )
}

function ComponentOptionsForZone({
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
              {[1, 3, 5, 7].map((count) => (
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
            fontSize: 16,
          }}
        >
          <Col span={8}>{t('component.fields.zone')}</Col>
          <Col span={8}>{t('component.fields.spec')}</Col>
          <Col span={8}>{t('component.fields.amount')}</Col>
        </Row>
        <Divider style={{ margin: '12px 0' }} />
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

function ComponentOptionsForHost({
  region,
  arch,
  component,
  idx,
  form,
}: {
  region?: string
  arch?: string
  component: ComponentKnowledge
  idx: number
  form: FormInstance<RequestClusterCreate>
}) {
  const { t } = useI18n()

  const tikvReplicaOptions = [1, 3, 5, 7]
  const required = component.minInstance > 0
  const isDiskSpecified = component.purposeType.toLowerCase() === 'storage'

  const { zonesWithHosts: zones, hostsForZones } = useHostOptions(
    region,
    arch,
    component.purposeType,
    component.zones
  )
  const isEmpty = !zones.length

  const [hostSelectState, setHostSelectState] = useState<{
    [k: string]: boolean
  }>({})

  const hostOptions = useMemo(() => {
    const restHosts = hostsForZones.filter((host) => !hostSelectState[host.ip!])
    const options = zones
      .map((zone) => {
        const hosts = restHosts.filter((host) => host.az === zone.id)

        return {
          value: zone.id,
          label: zone.name,
          children: hosts.map((host) => ({
            value: host.ip,
            label: `${host.ip} (${host.hostName})`,
          })),
        }
      })
      .filter((zoneOption) => zoneOption.children.length > 0)

    return options
  }, [zones, hostsForZones, hostSelectState])

  return (
    <Collapse
      collapsible="header"
      defaultActiveKey={required ? ['1'] : []}
      className={styles.componentForHost}
      ghost
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
            name={['resourceParameters', 'manual', 'replica']}
            label={t('component.fields.copies')}
            initialValue={3}
          >
            <Select>
              {tikvReplicaOptions.map((count) => (
                <Select.Option key={count} value={count}>
                  {count}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}
        {isEmpty ? (
          <Empty description={t('message.noHost')} />
        ) : (
          <Form.List
            name={[
              'resourceParameters',
              'instanceResource',
              idx,
              'resourceForHost',
            ]}
          >
            {(hostFields, { add, remove }, { errors }) => (
              <>
                {hostFields.map((hostField) => {
                  const { zoneCode, zoneLabel, hostIp, hostLabel } =
                    form.getFieldValue([
                      'resourceParameters',
                      'instanceResource',
                      idx,
                      'resourceForHost',
                      hostField.name,
                    ]) || {}

                  const currentHost = hostsForZones.find(
                    (host) => host.ip === hostIp
                  )

                  const specsForHost =
                    zones
                      .find((zone) => zone.id === zoneCode)
                      ?.specs.filter(
                        (spec) => spec.diskType === currentHost?.diskType
                      ) || []

                  const diskCount = currentHost?.availableDiskCount || 0
                  const validDisks =
                    currentHost?.disks?.filter(
                      (disk) => disk.status?.toLowerCase() === 'available'
                    ) || []

                  return (
                    <div key={hostField.key} className={styles.hostBlock}>
                      <div className={styles.hostBlockActionBar}>
                        <MinusCircleOutlined
                          onClick={() => {
                            remove(hostField.name)
                            setHostSelectState((state) => ({
                              ...state,
                              [hostIp]: false,
                            }))
                          }}
                        />
                      </div>
                      <Form.Item
                        fieldKey={[hostField.fieldKey, 'zoneCode']}
                        name={[hostField.name, 'zoneCode']}
                        hidden
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item
                        fieldKey={[hostField.fieldKey, 'hostIp']}
                        name={[hostField.name, 'hostIp']}
                        hidden
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item
                        fieldKey={[hostField.fieldKey, 'diskType']}
                        name={[hostField.name, 'diskType']}
                        hidden
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item
                        colon
                        labelAlign="right"
                        labelCol={{ span: 4 }}
                        label={t('component.fields.host')}
                      >
                        {zoneLabel} - {hostLabel}
                      </Form.Item>
                      {!isDiskSpecified && (
                        <Form.Item
                          colon
                          labelAlign="right"
                          labelCol={{ span: 4 }}
                          label={t('component.fields.instance')}
                          tooltip={
                            <Trans
                              t={t}
                              i18nKey="component.tooltip.instance"
                              values={{
                                count: validDisks.length,
                              }}
                            />
                          }
                        >
                          <Form.List name={[hostField.name, 'instances']}>
                            {(specFields, { add, remove }, { errors }) => (
                              <>
                                {specFields.map((specField) => (
                                  <div key={specField.key}>
                                    <Space
                                      className={styles.instanceField}
                                      align="baseline"
                                      size="large"
                                    >
                                      <Form.Item
                                        fieldKey={[specField.name, 'specCode']}
                                        name={[specField.name, 'specCode']}
                                      >
                                        <Select>
                                          {specsForHost.map((spec) => (
                                            <Select.Option
                                              key={spec.id}
                                              // FIXME: remove spec rewrite
                                              value={`${spec.cpu}C${spec.memory}G`}
                                            >
                                              {spec.id} ({spec.cpu}C{' '}
                                              {spec.memory}
                                              G)
                                            </Select.Option>
                                          ))}
                                        </Select>
                                      </Form.Item>
                                      {specFields.length > 1 ? (
                                        <MinusCircleOutlined
                                          className={styles.instanceActionIcon}
                                          onClick={() => remove(specField.name)}
                                        />
                                      ) : null}
                                    </Space>
                                  </div>
                                ))}
                                {specFields.length < diskCount && (
                                  <Button
                                    type="dashed"
                                    icon={<PlusOutlined />}
                                    onClick={() => {
                                      const { cpu, memory } =
                                        specsForHost[0] || {}
                                      add({
                                        specCode:
                                          isNumber(cpu) && isNumber(memory)
                                            ? `${cpu}C${memory}G`
                                            : '',
                                      })
                                    }}
                                  >
                                    {t('component.actions.addInstance')}
                                  </Button>
                                )}
                                <Form.ErrorList errors={errors} />
                              </>
                            )}
                          </Form.List>
                        </Form.Item>
                      )}
                      {isDiskSpecified && (
                        <Form.Item
                          colon
                          labelAlign="right"
                          labelCol={{ span: 4 }}
                          label={t('component.fields.instance')}
                          tooltip={
                            <Trans
                              t={t}
                              i18nKey="component.tooltip.instance"
                              values={{
                                count: validDisks.length,
                              }}
                            />
                          }
                        >
                          <Form.List name={[hostField.name, 'instances']}>
                            {(specFields, { add, remove }, { errors }) => (
                              <>
                                {specFields.map((specField) => {
                                  const { diskId } =
                                    form.getFieldValue([
                                      'resourceParameters',
                                      'instanceResource',
                                      idx,
                                      'resourceForHost',
                                      hostField.name,
                                      'instances',
                                      specField.name,
                                    ]) || {}

                                  const currentDisk =
                                    validDisks.find(
                                      (disk) => disk.diskId === diskId
                                    ) || {}

                                  return (
                                    <div key={specField.key}>
                                      <Form.Item
                                        fieldKey={[
                                          specField.fieldKey,
                                          'diskId',
                                        ]}
                                        name={[specField.name, 'diskId']}
                                        hidden
                                      >
                                        <Input />
                                      </Form.Item>
                                      <Space
                                        className={styles.instanceDiskField}
                                        align="baseline"
                                        size="large"
                                      >
                                        <Form.Item
                                          label={t('component.fields.disk')}
                                        >
                                          {currentDisk.name}, {currentDisk.path}
                                        </Form.Item>
                                        <Form.Item
                                          fieldKey={[
                                            specField.name,
                                            'specCode',
                                          ]}
                                          name={[specField.name, 'specCode']}
                                          label={t('component.fields.spec')}
                                        >
                                          <Select>
                                            {specsForHost.map((spec) => (
                                              <Select.Option
                                                key={spec.id}
                                                // FIXME: remove spec rewrite
                                                value={`${spec.cpu}C${spec.memory}G`}
                                              >
                                                {spec.id} ({spec.cpu}C{' '}
                                                {spec.memory}
                                                G)
                                              </Select.Option>
                                            ))}
                                          </Select>
                                        </Form.Item>
                                        <MinusCircleOutlined
                                          className={styles.instanceActionIcon}
                                          onClick={() => remove(specField.name)}
                                        />
                                      </Space>
                                    </div>
                                  )
                                })}
                                {specFields.length < diskCount && (
                                  <Dropdown
                                    overlay={() => {
                                      const instanceValues: {
                                        specCode: string
                                        diskId: string
                                      }[] =
                                        form.getFieldValue([
                                          'resourceParameters',
                                          'instanceResource',
                                          idx,
                                          'resourceForHost',
                                          hostField.name,
                                          'instances',
                                        ]) || []
                                      const selectedDisks = instanceValues
                                        .map((item) => item.diskId)
                                        .filter((el) => el)
                                      const restDisks = validDisks.filter(
                                        (disk) =>
                                          !selectedDisks.includes(disk.diskId!)
                                      )

                                      return (
                                        <Menu
                                          onClick={({ key: diskId }) => {
                                            const { cpu, memory } =
                                              specsForHost[0] || {}

                                            add({
                                              specCode:
                                                isNumber(cpu) &&
                                                isNumber(memory)
                                                  ? `${cpu}C${memory}G`
                                                  : '',
                                              diskId,
                                            })
                                          }}
                                        >
                                          {restDisks.map((disk) => (
                                            <Menu.Item key={disk.diskId}>
                                              {disk.name}, {disk.path}
                                            </Menu.Item>
                                          ))}
                                        </Menu>
                                      )
                                    }}
                                  >
                                    <Button
                                      type="dashed"
                                      icon={<PlusOutlined />}
                                    >
                                      {t('component.actions.addDisk')}
                                    </Button>
                                  </Dropdown>
                                )}
                                <Form.ErrorList errors={errors} />
                              </>
                            )}
                          </Form.List>
                        </Form.Item>
                      )}
                    </div>
                  )
                })}
                {hostOptions.length > 0 && (
                  <Cascader
                    options={hostOptions}
                    onChange={(value, selectedOptions) => {
                      const [zoneId, hostIp] = value || []
                      const [zoneLabel, hostLabel] =
                        selectedOptions?.map((item) => item.label) || []

                      const currentHost = hostsForZones.find(
                        (host) => host.ip === hostIp
                      )
                      const specsForHost =
                        zones
                          .find((zone) => zone.id === zoneId)
                          ?.specs?.filter(
                            (spec) => spec.diskType === currentHost?.diskType
                          ) || []
                      const { cpu: defaultCPU, memory: defaultMemory } =
                        specsForHost[0] || {}

                      const disks =
                        currentHost?.disks?.filter(
                          (disk) => disk.status?.toLowerCase() === 'available'
                        ) || []
                      const { diskId: defaultDiskId } = disks[0] || {}

                      add({
                        zoneCode: zoneId,
                        zoneLabel,
                        hostIp,
                        hostLabel,
                        diskType: currentHost?.diskType,
                        instances: [
                          {
                            specCode:
                              isNumber(defaultCPU) && isNumber(defaultMemory)
                                ? `${defaultCPU}C${defaultMemory}G`
                                : '',
                            diskId: isDiskSpecified ? defaultDiskId : undefined,
                          },
                        ],
                      })
                      setHostSelectState((state) => ({
                        ...state,
                        [hostIp]: true,
                      }))
                    }}
                  >
                    <Button type="dashed" icon={<PlusOutlined />}>
                      {t('component.actions.addHost')}
                    </Button>
                  </Cascader>
                )}
                <Form.ErrorList errors={errors} />
              </>
            )}
          </Form.List>
        )}
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
          { min: 4, max: 64, message: t('cluster.rules.name.length') },
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
      <Form.Item label={t('cluster.fields.user')}>
        <span>root</span>
      </Form.Item>
      <Form.Item
        name="dbPassword"
        label={t('cluster.fields.password')}
        tooltip={t('cluster.tooltip.password')}
        rules={[
          { required: true, message: t('cluster.rules.password.require') },
          { min: 8, max: 64, message: t('cluster.rules.password.length') },
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
  allocationType,
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
  allocationType: string
}) {
  const { t, i18n } = useI18n()
  const previewCreateCluster = usePreviewCreateCluster()

  const columns = useMemo(() => {
    return allocationType === 'SpecificHost'
      ? getManualColumns(t)
      : getAutoColumns(t)
  }, [i18n.language, allocationType])

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
              errorMessage: t('preview.failed'),
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
                title: t('preview.title'),
                okButtonProps: {
                  disabled: !isSubmittable,
                },
                okText: t('preview.actions.confirm'),
                cancelText: t('preview.actions.cancel'),
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

function getAutoColumns(
  t: TFunction<''>
): TableColumnsType<
  Exclude<ClusterPreview['stockCheckResult'], undefined>[number]
> {
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

function getManualColumns(
  t: TFunction<''>
): TableColumnsType<
  Exclude<ClusterPreview['stockCheckResult'], undefined>[number]
> {
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
      title: t('preview.columns.host'),
      width: 80,
      dataIndex: 'hostIp',
      key: 'host',
    },
    // {
    //   title: t('preview.columns.diskType'),
    //   width: 80,
    //   dataIndex: 'diskType',
    //   key: 'diskType',
    // },
    // {
    //   title: t('preview.columns.diskId'),
    //   width: 60,
    //   dataIndex: 'diskId',
    //   key: 'diskId',
    //   render: (value) => value || '-',
    // },
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
