import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQueryClient } from 'react-query'
import {
  Button,
  Card,
  Cascader,
  Col,
  Collapse,
  Descriptions,
  Divider,
  Dropdown,
  Empty,
  Form,
  FormInstance,
  Input,
  InputNumber,
  Layout,
  Menu,
  Modal,
  Radio,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  TableColumnsType,
} from 'antd'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { TFunction, Trans } from 'react-i18next'
import { loadI18n, useI18n } from '@i18n-macro'
import IntlPopConfirm from '@/components/IntlPopConfirm'
import {
  ClusterComponentNodeInfo,
  ClusterInfo,
  ClusterPreview,
  ClusterRawTopologyItem,
  ClusterRawTopologyResourceItem,
  RequestClusterScaleOut,
} from '@/api/model'
import {
  invalidateClusterDetail,
  useClusterScaleOut,
  usePreviewScaleOutCluster,
} from '@/api/hooks/cluster'
import { removeArrayItem, replaceArrayItem } from '@/utils/arr'
import { isNumber } from '@/utils/types'
import {
  ComponentKnowledge,
  ResourceForHost,
  useComponents,
  useHostOptions,
} from '@/components/CreateClusterPanel/helpers'

import formStyles from '@/components/CreateClusterPanel/index.module.less'

import panelStyles from './index.module.less'

const styles = {
  ...panelStyles,
  ...formStyles,
}

loadI18n()

export interface ScaleOutPanelProps {
  cluster: ClusterInfo
  topology: ClusterRawTopologyItem[]
  topologyDetails: ClusterComponentNodeInfo[]
  back: () => void
}

export function ScaleOutPanel({
  back,
  cluster,
  topology,
  topologyDetails,
}: ScaleOutPanelProps) {
  const [form] = Form.useForm()
  const queryClient = useQueryClient()
  const previewScaleOutCluster = usePreviewScaleOutCluster()
  const scaleOutCluster = useClusterScaleOut()
  const {
    cpuArchitecture: arch,
    clusterType,
    clusterVersion,
    region,
    vendor,
  } = cluster

  const components = useComponents(
    vendor,
    region,
    clusterType,
    clusterVersion,
    arch
  )

  const [allocationType, setAllocationType] = useState<string>('SpecificZone')

  const { t, i18n } = useI18n()

  const basicInfo = useMemo(
    () =>
      !!clusterType &&
      !!clusterVersion && (
        <BasicOptions
          t={t}
          cluster={cluster}
          onAllocationTypeChange={setAllocationType}
        />
      ),
    [cluster, i18n.language]
  )

  const nodeOptionsForZone = useMemo(
    () =>
      components.map((comp, idx) => (
        <ComponentOptionsForZone
          t={t}
          key={comp.id}
          idx={idx}
          component={comp}
          existed={topology.find((tp) => tp.componentType === comp.id)}
        />
      )),
    [i18n.language, components]
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
          defaultNodes={topologyDetails.filter((item) => item.type === comp.id)}
        />
      )),
    [form, components, region, arch]
  )

  const nodeOptions = useMemo(
    () => (
      <Form.Item<RequestClusterScaleOut>
        noStyle
        shouldUpdate={(prevValues, currentValues) =>
          prevValues.requestResourceMode !== currentValues.requestResourceMode
        }
      >
        {(form) => {
          const allocationType: string = form.getFieldValue(
            'requestResourceMode'
          )

          return allocationType === 'SpecificHost'
            ? nodeOptionsForHost
            : nodeOptionsForZone
        }}
      </Form.Item>
    ),
    [nodeOptionsForZone, nodeOptionsForHost]
  )

  const onReset = useCallback(() => {
    form.resetFields()
  }, [form])

  const columns = useMemo(() => {
    return allocationType === 'SpecificHost'
      ? getManualColumns(t)
      : getAutoColumns(t)
  }, [i18n.language, allocationType])

  const [loadingPreview, setLoadingPreview] = useState(false)

  const onSubmit = useCallback(async () => {
    try {
      // FIXME: Fix types
      const data = await form.validateFields()

      setLoadingPreview(true)

      const requestResourceMode = data.requestResourceMode
      let diff: ClusterRawTopologyItem[] = []

      if (requestResourceMode === 'SpecificHost') {
        diff = getManualDiffResource(data.instanceResource, cluster.region!)
      } else {
        diff = (data.instanceResource as RawScaleOutResources[])
          .filter((r) => !!r)
          .map((r) => findAutoDiff(r))

        // FIXME: remove zone rewrite
        diff.forEach((comp) => {
          comp.resource =
            comp.resource?.map((r) => ({
              ...r,
              zoneCode: `${cluster.region},${r.zoneCode}`,
            })) || []
        })
      }

      const applyScaleOut = () => {
        scaleOutCluster.mutateAsync(
          {
            payload: {
              clusterId: cluster.clusterId!,
              instanceResource: diff,
              requestResourceMode: requestResourceMode,
            },
            options: {
              successMessage: t('actions.scaleOut.success'),
              errorMessage: t('actions.scaleOut.failed'),
            },
          },
          {
            onSuccess() {
              invalidateClusterDetail(queryClient, cluster.clusterId!)
              back()
            },
          }
        )
      }

      await previewScaleOutCluster.mutateAsync(
        {
          payload: {
            id: cluster.clusterId!,
            instanceResource: diff,
            requestResourceMode: requestResourceMode,
          },
          options: {
            errorMessage: t('actions.preview.failed'),
            skipSuccessNotification: true,
          },
        },
        {
          onSuccess(resp) {
            const { stockCheckResult } = resp.data!.data!
            const data = stockCheckResult!.map((r, id) => ({
              id,
              ...r,
            }))
            const isSubmittable = data.length && !data.find((r) => !r.enough)
            Modal.confirm({
              icon: <></>,
              width: 800,
              okButtonProps: {
                disabled: !isSubmittable,
              },
              okText: t('preview.actions.confirm'),
              content: (
                <div>
                  <Table
                    size="small"
                    columns={columns}
                    dataSource={data}
                    locale={{
                      emptyText: t('preview.empty'),
                    }}
                    rowKey="id"
                    pagination={false}
                  />
                </div>
              ),
              onOk() {
                applyScaleOut()
              },
            })
          },
          onSettled() {
            setLoadingPreview(false)
          },
        }
      )
    } catch (e) {
      // NO_OP
    }
  }, [
    back,
    queryClient,
    previewScaleOutCluster.mutateAsync,
    scaleOutCluster.mutateAsync,
    form,
    i18n.language,
    cluster,
    columns,
  ])

  return (
    <Layout className={styles.panel}>
      <Form
        layout="horizontal"
        hideRequiredMark
        colon={false}
        form={form}
        name="create"
        className={`${styles.form} ${styles.simpleForm}`}
      >
        <Row>{basicInfo}</Row>
        {nodeOptions}
      </Form>
      <Submitter
        onSubmit={onSubmit}
        onReset={onReset}
        loading={loadingPreview}
      />
    </Layout>
  )
}

function BasicOptions({
  t,
  cluster,
  onAllocationTypeChange,
}: {
  t: TFunction<''>
  cluster: ClusterInfo
  onAllocationTypeChange: (allocationType: string) => void
}) {
  return (
    <Card title={t('basic.title')} bordered={false}>
      <Descriptions size="small" column={2} className={styles.desc}>
        <Descriptions.Item label={t('model:cluster.property.id')}>
          {cluster.clusterId}
        </Descriptions.Item>
        <Descriptions.Item label={t('model:cluster.property.name')}>
          {cluster.clusterName}
        </Descriptions.Item>
        <Descriptions.Item label={t('model:cluster.property.vendor')}>
          {t(
            `model:cluster.vendor.${cluster.vendor?.toLowerCase()}`,
            cluster.vendor
          )}
        </Descriptions.Item>
        <Descriptions.Item label={t('model:cluster.property.region')}>
          {cluster.region}
        </Descriptions.Item>
        <Descriptions.Item label={t('model:cluster.property.type')}>
          {cluster.clusterType}
        </Descriptions.Item>
        <Descriptions.Item label={t('model:cluster.property.version')}>
          {cluster.clusterVersion}
        </Descriptions.Item>
      </Descriptions>
      <Form.Item
        className={styles.basicFormItem}
        name="requestResourceMode"
        label={t('basic.fields.allocation')}
        colon
        labelAlign="left"
        rules={[{ required: true }]}
        initialValue="SpecificZone"
      >
        <Radio.Group onChange={(e) => onAllocationTypeChange(e.target.value)}>
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
  existed,
}: {
  t: TFunction<''>
  component: ComponentKnowledge
  idx: number
  existed?: ClusterRawTopologyItem
}) {
  const required = component.minInstance > 0
  const [addedZones, setAddedZones] = useState<string[]>([])
  const addableZones = component.zones.filter(
    (zone) =>
      !addedZones.includes(zone.id) &&
      !existed?.resource?.find((r) => r.zoneCode === zone.id)
  )
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
            {t('nodes.title', {
              name: component.name,
            })}
            {!required && (
              <Tag color="default" className={styles.optionalBadge}>
                {t('nodes.optional')}
              </Tag>
            )}
          </span>
        }
      >
        <Form.Item
          name={['instanceResource', idx, 'componentType']}
          hidden
          initialValue={component.id}
        >
          <Input />
        </Form.Item>
        <Row
          gutter={20}
          style={{
            fontSize: 16,
          }}
        >
          <Col span={7}>{t('nodes.fields.zone')}</Col>
          <Col span={7}>{t('nodes.fields.spec')}</Col>
          <Col span={4}>{t('nodes.fields.oldAmount')}</Col>
          <Col span={4}>{t('nodes.fields.newAmount')}</Col>
        </Row>
        <Divider style={{ margin: '12px 0' }} />
        {(
          <>
            {existed?.resource?.map((resource, i) => {
              const zone = component.zones.find(
                (z) => z.id === resource.zoneCode
              )
              return (
                <Row key={i} gutter={20}>
                  <Col span={7}>
                    <Form.Item
                      name={[
                        'instanceResource',
                        idx,
                        'modifiedResources',
                        i,
                        'zoneCode',
                      ]}
                      initialValue={resource.zoneCode}
                      hidden
                    >
                      <Input />
                    </Form.Item>
                    <div className={styles.zoneName}>
                      {zone?.name || resource.zoneCode}
                    </div>
                  </Col>
                  <Col span={7}>
                    <Form.Item
                      name={[
                        'instanceResource',
                        idx,
                        'modifiedResources',
                        i,
                        'specCode',
                      ]}
                      initialValue={resource.specCode}
                      hidden
                    >
                      <Input />
                    </Form.Item>
                    <div className={styles.zoneName}>{resource.specCode}</div>
                  </Col>
                  <Col span={4}>
                    <Form.Item
                      name={[
                        'instanceResource',
                        idx,
                        'modifiedResources',
                        i,
                        'oldCount',
                      ]}
                      initialValue={resource.count || 0}
                    >
                      <div className={styles.oldAmount}>
                        {resource.count || 0}
                      </div>
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item
                      name={[
                        'instanceResource',
                        idx,
                        'modifiedResources',
                        i,
                        'count',
                      ]}
                      initialValue={resource.count || 0}
                    >
                      <InputNumber min={resource.count} />
                    </Form.Item>
                  </Col>
                </Row>
              )
            })}
            <Form.List name={['instanceResource', idx, 'appendResources']}>
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, fieldKey }) => {
                    const zone = component.zones.find(
                      (z) => z.id === addedZones[name]
                    )
                    const zoneOptions = addableZones.concat(zone ? [zone] : [])

                    return (
                      <Row key={key} gutter={20}>
                        <Col span={7}>
                          <Form.Item
                            fieldKey={[fieldKey, 'zoneCode']}
                            name={[name, 'zoneCode']}
                            initialValue={zone?.id}
                          >
                            <Select
                              onChange={(z: string) =>
                                setAddedZones(
                                  replaceArrayItem(addedZones, name, z)
                                )
                              }
                            >
                              {zoneOptions.map((zone) => (
                                <Select.Option key={zone.id} value={zone.id}>
                                  {zone.name}
                                </Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={7}>
                          <Form.Item
                            fieldKey={[fieldKey, 'specCode']}
                            name={[name, 'specCode']}
                            // FIXME: remove spec rewrite
                            initialValue={
                              zone?.specs[0] &&
                              `${zone.specs[0].cpu}C${zone.specs[0].memory}G`
                            }
                          >
                            <Select>
                              {zone?.specs.map((spec) => (
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
                        <Col span={4}>
                          <Form.Item
                            fieldKey={[fieldKey, 'oldCount']}
                            name={[name, 'oldCount']}
                            initialValue={0}
                          >
                            <div className={styles.oldAmount}>{0}</div>
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                          <Form.Item
                            fieldKey={[fieldKey, 'count']}
                            name={[name, 'count']}
                            initialValue={0}
                          >
                            <InputNumber min={0} />
                          </Form.Item>
                        </Col>
                        <Col span={1}>
                          <Tooltip title={t('nodes.remove')}>
                            <MinusCircleOutlined
                              className={styles.removeBtn}
                              onClick={() => {
                                setAddedZones(removeArrayItem(addedZones, name))
                                remove(name)
                              }}
                            />
                          </Tooltip>
                        </Col>
                      </Row>
                    )
                  })}
                  {addableZones.length > 0 && (
                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => {
                          setAddedZones([...addedZones, addableZones[0].id])
                          add()
                        }}
                        block
                        icon={<PlusOutlined />}
                      >
                        {t('nodes.add')}
                      </Button>
                    </Form.Item>
                  )}
                </>
              )}
            </Form.List>
          </>
        ) || <Empty description={t('message.noZone')} />}
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
  defaultNodes,
}: {
  region?: string
  arch?: string
  component: ComponentKnowledge
  idx: number
  form: FormInstance<RequestClusterScaleOut>
  defaultNodes: ClusterComponentNodeInfo[]
}) {
  const { t } = useI18n()

  const required = component.minInstance > 0
  const isDiskSpecified = component.purposeType.toLowerCase() === 'storage'
  const defaultHostIDs = useMemo(
    () => defaultNodes.map((node) => node.hostID),
    [defaultNodes]
  )

  const {
    zonesWithHosts: zones,
    hostsForZones,
    rawHostList,
  } = useHostOptions(region, arch, component.purposeType, component.zones)

  const [hostSelectState, setHostSelectState] = useState<{
    [k: string]: boolean
  }>({})

  const hostOptions = useMemo(() => {
    const restHosts = hostsForZones.filter(
      (host) =>
        !hostSelectState[host.ip!] && !defaultHostIDs.includes(host.hostId)
    )
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
  }, [defaultHostIDs, zones, hostsForZones, hostSelectState])

  const initialNodeValues = useMemo(() => {
    const nodeValueHashmap = defaultNodes
      .map((node) => {
        const { hostID: hostId, diskId } = node
        const zoneName = node.zone?.zoneName
        const specCode = node.spec?.id
        const hostDetail = rawHostList.find((host) => host.hostId === hostId)

        return {
          zoneCode: hostDetail?.az,
          zoneLabel: zoneName,
          hostId: hostId!,
          hostIp: hostDetail?.ip,
          hostLabel: `${hostDetail?.ip} (${hostDetail?.hostName})`,
          diskType: hostDetail?.diskType,
          diskId,
          specCode,
        }
      })
      .reduce((prev, node) => {
        const { hostId } = node
        const instance = {
          diskId: node.diskId,
          specCode: node.specCode,
          existing: true,
        }

        if (!prev[hostId]) {
          return {
            ...prev,
            [hostId]: {
              zoneCode: node.zoneCode,
              zoneLabel: node.zoneLabel,
              hostId,
              hostIp: node.hostIp,
              hostLabel: node.hostLabel,
              diskType: node.diskType,
              instances: [instance],
            },
          }
        } else {
          prev[hostId].instances = prev[hostId].instances.concat([instance])

          return prev
        }
      }, {} as any)

    const nodeValues = Object.values(nodeValueHashmap)

    return nodeValues
  }, [defaultNodes, rawHostList])

  useEffect(() => {
    form.setFields([
      {
        name: ['instanceResource', idx, 'resourceForHost'],
        value: initialNodeValues,
      },
    ])
  }, [initialNodeValues, form])

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
            {t('nodes.title', {
              name: component.name,
            })}
            {!required && (
              <Tag color="default" className={styles.optionalBadge}>
                {t('nodes.optional')}
              </Tag>
            )}
          </span>
        }
      >
        <Form.Item
          name={['instanceResource', idx, 'componentType']}
          hidden
          initialValue={component.id}
        >
          <Input />
        </Form.Item>
        <Form.List
          name={['instanceResource', idx, 'resourceForHost']}
          initialValue={initialNodeValues}
        >
          {(hostFields, { add, remove }, { errors }) => (
            <>
              {hostFields.map((hostField) => {
                const { zoneCode, zoneLabel, hostIp, hostLabel } =
                  form.getFieldValue([
                    'instanceResource',
                    idx,
                    'resourceForHost',
                    hostField.name,
                  ]) || {}

                const currentHost = rawHostList.find(
                  (host) => host.ip === hostIp
                )

                const hostExisting = defaultHostIDs.includes(
                  currentHost?.hostId
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
                  <div
                    key={hostField.key}
                    className={`${styles.hostBlock} ${
                      hostExisting ? styles.existingHostBlock : ''
                    }`}
                  >
                    {!hostExisting && (
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
                    )}
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
                      label={t('manualNodes.fields.host')}
                    >
                      {zoneLabel} - {hostLabel}
                    </Form.Item>
                    {!isDiskSpecified && (
                      <Form.Item
                        colon
                        labelAlign="right"
                        labelCol={{ span: 4 }}
                        label={t('manualNodes.fields.instance')}
                        tooltip={
                          <Trans
                            t={t}
                            i18nKey="manualNodes.tooltip.instance"
                            values={{
                              count: validDisks.length,
                            }}
                          />
                        }
                      >
                        <Form.List name={[hostField.name, 'instances']}>
                          {(specFields, { add, remove }, { errors }) => {
                            const specFieldValues: ResourceForHost['instances'] =
                              form.getFieldValue([
                                'instanceResource',
                                idx,
                                'resourceForHost',
                                hostField.name,
                                'instances',
                              ]) || []
                            const specAddable =
                              specFieldValues.filter(
                                (field) => !field?.existing
                              ).length < diskCount

                            return (
                              <>
                                {specFields.map((specField) => {
                                  const { existing } =
                                    form.getFieldValue([
                                      'instanceResource',
                                      idx,
                                      'resourceForHost',
                                      hostField.name,
                                      'instances',
                                      specField.name,
                                    ]) || {}

                                  return existing ? (
                                    <Form.Item
                                      key={specField.key}
                                      fieldKey={[specField.name, 'specCode']}
                                      name={[specField.name, 'specCode']}
                                    >
                                      <Input disabled />
                                    </Form.Item>
                                  ) : (
                                    <div key={specField.key}>
                                      <Space
                                        className={styles.genericInstanceField}
                                        align="baseline"
                                        size="large"
                                      >
                                        <Form.Item
                                          fieldKey={[
                                            specField.name,
                                            'specCode',
                                          ]}
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
                                            className={
                                              styles.instanceActionIcon
                                            }
                                            onClick={() =>
                                              remove(specField.name)
                                            }
                                          />
                                        ) : null}
                                      </Space>
                                    </div>
                                  )
                                })}
                                {specAddable && (
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
                                        existing: false,
                                      })
                                    }}
                                  >
                                    {t('manualNodes.actions.addInstance')}
                                  </Button>
                                )}
                                <Form.ErrorList errors={errors} />
                              </>
                            )
                          }}
                        </Form.List>
                      </Form.Item>
                    )}
                    {isDiskSpecified && (
                      <Form.Item
                        colon
                        labelAlign="right"
                        labelCol={{ span: 4 }}
                        label={t('manualNodes.fields.instance')}
                        tooltip={
                          <Trans
                            t={t}
                            i18nKey="manualNodes.tooltip.instance"
                            values={{
                              count: validDisks.length,
                            }}
                          />
                        }
                      >
                        <Form.List name={[hostField.name, 'instances']}>
                          {(specFields, { add, remove }, { errors }) => {
                            const specFieldValues: ResourceForHost['instances'] =
                              form.getFieldValue([
                                'instanceResource',
                                idx,
                                'resourceForHost',
                                hostField.name,
                                'instances',
                              ]) || []
                            const specAddable =
                              specFieldValues.filter(
                                (field) => !field?.existing
                              ).length < diskCount

                            return (
                              <>
                                {specFields.map((specField) => {
                                  const { diskId, existing } =
                                    form.getFieldValue([
                                      'instanceResource',
                                      idx,
                                      'resourceForHost',
                                      hostField.name,
                                      'instances',
                                      specField.name,
                                    ]) || {}

                                  const currentDisk =
                                    currentHost?.disks?.find(
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
                                        className={`${
                                          styles.storageInstanceField
                                        } ${
                                          existing
                                            ? styles.existingNodeFormItem
                                            : ''
                                        }`}
                                        align="baseline"
                                        size="large"
                                      >
                                        <Form.Item
                                          className={styles.storageInstanceDisk}
                                          label={t('manualNodes.fields.disk')}
                                        >
                                          {currentDisk.name}, {currentDisk.path}
                                        </Form.Item>
                                        {existing ? (
                                          <Form.Item
                                            className={
                                              styles.storageInstanceSpec
                                            }
                                            fieldKey={[
                                              specField.name,
                                              'specCode',
                                            ]}
                                            name={[specField.name, 'specCode']}
                                            label={t('manualNodes.fields.spec')}
                                          >
                                            <Input disabled />
                                          </Form.Item>
                                        ) : (
                                          <>
                                            <Form.Item
                                              className={
                                                styles.storageInstanceSpec
                                              }
                                              fieldKey={[
                                                specField.name,
                                                'specCode',
                                              ]}
                                              name={[
                                                specField.name,
                                                'specCode',
                                              ]}
                                              label={t(
                                                'manualNodes.fields.spec'
                                              )}
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
                                              className={
                                                styles.instanceActionIcon
                                              }
                                              onClick={() =>
                                                remove(specField.name)
                                              }
                                            />
                                          </>
                                        )}
                                      </Space>
                                    </div>
                                  )
                                })}
                                {specAddable && (
                                  <Dropdown
                                    overlay={() => {
                                      const instanceValues: {
                                        specCode: string
                                        diskId: string
                                      }[] =
                                        form.getFieldValue([
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
                                              existing: false,
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
                                      {t('manualNodes.actions.addDisk')}
                                    </Button>
                                  </Dropdown>
                                )}
                                <Form.ErrorList errors={errors} />
                              </>
                            )
                          }}
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
                      hostId: currentHost?.hostId,
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
                          existing: false,
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
                    {t('manualNodes.actions.addHost')}
                  </Button>
                </Cascader>
              )}
              <Form.ErrorList errors={errors} />
            </>
          )}
        </Form.List>
      </Collapse.Panel>
    </Collapse>
  )
}

function Submitter({
  loading,
  onReset,
  onSubmit,
}: {
  loading: boolean
  onReset: () => unknown
  onSubmit: () => unknown
}) {
  const { t } = useI18n()

  return (
    <div className={`${styles.submitter} ${styles.footer}`}>
      <IntlPopConfirm title={t('footer.reset.confirm')} onConfirm={onReset}>
        <Button size="large">{t('footer.reset.title')}</Button>
      </IntlPopConfirm>
      <Button size="large" type="primary" onClick={onSubmit} loading={loading}>
        {t('footer.submit.title')}
      </Button>
    </div>
  )
}

type RawScaleOutResources = {
  componentType: string
  appendResources?: (ClusterRawTopologyResourceItem & { oldCount: number })[]
  modifiedResources?: (ClusterRawTopologyResourceItem & { oldCount: number })[]
}

function findAutoDiff({
  componentType,
  modifiedResources = [],
  appendResources = [],
}: RawScaleOutResources): ClusterRawTopologyItem {
  const result: ClusterRawTopologyItem = { componentType, resource: [] }
  ;[...modifiedResources, ...appendResources].forEach((r) => {
    if (r.oldCount < r.count!) {
      result.resource!.push({
        zoneCode: r.zoneCode,
        specCode: r.specCode,
        count: r.count! - r.oldCount!,
      })
    }
  })
  result.totalNodeCount = result.resource!.reduce(
    (sum, cur) => sum + cur.count!,
    0
  )
  return result
}

type ManualScaleOutResources = {
  componentType: string
  resourceForHost: ResourceForHost[]
}

function getManualDiffResource(
  components: ManualScaleOutResources[],
  region: string
) {
  const componentsResult = components?.map((comp) => {
    const resource = comp.resourceForHost?.flatMap((host) => {
      return host.instances
        .filter((el) => !el.existing)
        .map((el) => {
          const diskHashmap = el.diskId ? { diskId: el.diskId } : {}

          // FIXME: remove zone id rewrite
          return {
            count: 1,
            zoneCode: `${region},${host.zoneCode}`,
            hostIp: host.hostIp,
            specCode: el.specCode,
            diskType: host.diskType,
            ...diskHashmap,
          }
        })
    })

    return {
      componentType: comp.componentType,
      resource: resource || [],
      totalNodeCount: resource.length,
    }
  })

  return componentsResult
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
