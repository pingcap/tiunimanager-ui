import { useCallback, useMemo, useState } from 'react'
import {
  ClusterInfo,
  ClusterPreview,
  ClusterRawTopologyItem,
  ClusterRawTopologyResourceItem,
} from '@/api/model'
import { loadI18n, useI18n } from '@i18n-macro'
import { TFunction } from 'react-i18next'
import {
  ComponentKnowledge,
  useComponents,
} from '@/components/CreateClusterPanel/helpers'
import {
  Button,
  Card,
  Col,
  Collapse,
  Descriptions,
  Divider,
  Empty,
  Form,
  Input,
  InputNumber,
  Layout,
  Modal,
  Row,
  Select,
  Table,
  Tag,
  Tooltip,
} from 'antd'
import panelStyles from './index.module.less'
import formStyles from '@/components/CreateClusterPanel/index.module.less'
import { useQueryClient } from 'react-query'
import IntlPopConfirm from '@/components/IntlPopConfirm'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import {
  invalidateClusterDetail,
  useClusterScaleOut,
  usePreviewScaleOutCluster,
} from '@/api/hooks/cluster'
import { ColumnsType } from 'antd/lib/table/interface'
import { removeArrayItem, replaceArrayItem } from '@/utils/arr'

const styles = {
  ...panelStyles,
  ...formStyles,
}

loadI18n()

export interface ScaleOutPanelProps {
  cluster: ClusterInfo
  topology: ClusterRawTopologyItem[]
  back: () => void
}

export function ScaleOutPanel({ back, cluster, topology }: ScaleOutPanelProps) {
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

  const { t, i18n } = useI18n()

  const basicInfo = useMemo(
    () =>
      !!clusterType &&
      !!clusterVersion && <BasicOptions t={t} cluster={cluster} />,
    [cluster, i18n.language]
  )

  const nodeOptions = components.map((comp, idx) => (
    <NodeOptions
      t={t}
      key={comp.id!}
      idx={idx}
      component={comp}
      existed={topology.find((tp) => tp.componentType === comp.id)}
    />
  ))

  const onReset = useCallback(() => {
    form.resetFields()
  }, [form])

  const columns = useMemo(() => getColumns(t), [i18n.language])

  const [loadingPreview, setLoadingPreview] = useState(false)

  const onSubmit = useCallback(async () => {
    try {
      const data = (await form.validateFields()) as {
        instanceResource: RawScaleOutResources[]
      }
      setLoadingPreview(true)
      const diff = data.instanceResource
        .filter((r) => !!r)
        .map((r) => findDiff(r))

      // FIXME: remove zone rewrite
      {
        diff.forEach((comp) => {
          comp.resource =
            comp.resource?.map((r) => ({
              ...r,
              zoneCode: `${region},${r.zoneCode}`,
            })) || []
        })
      }

      const applyScaleOut = () => {
        scaleOutCluster.mutateAsync(
          {
            payload: {
              clusterId: cluster.clusterId!,
              instanceResource: diff,
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
    previewScaleOutCluster.mutateAsync,
    scaleOutCluster.mutateAsync,
    form,
    i18n.language,
    cluster,
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
}: {
  t: TFunction<''>
  cluster: ClusterInfo
}) {
  return (
    <Card title={t('basic.title')}>
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
    </Card>
  )
}

function NodeOptions({
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
                              {addableZones.map((zone) => (
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

function findDiff({
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
