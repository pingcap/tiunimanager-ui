import { useCallback, useMemo } from 'react'
import {
  ClusterInfo,
  ClusterPreview,
  ClusterRawTopologyItem,
  ClusterRawTopologyResourceItem,
  HardwareArch,
  KnowledgeOfClusterComponent,
} from '@/api/model'
import { loadI18n, useI18n } from '@i18n-macro'
import { TFunction } from 'react-i18next'
import {
  AvailableStocksMap,
  useAvailableStocks,
  useKnowledgeMap,
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

// TODO: adapt to new knowledge
export function ScaleOutPanel({ back, cluster, topology }: ScaleOutPanelProps) {
  const [form] = Form.useForm()
  const queryClient = useQueryClient()
  const previewScaleOutCluster = usePreviewScaleOutCluster()
  const scaleOutCluster = useClusterScaleOut()
  const knowledgeMap = useKnowledgeMap()
  const { cpuArchitecture: arch, clusterType, clusterVersion, region } = cluster

  const availableStocksMap = useAvailableStocks(arch! as HardwareArch)

  const { t, i18n } = useI18n()

  const basicInfo = useMemo(
    () =>
      !!clusterType &&
      !!clusterVersion && <BasicOptions t={t} cluster={cluster} />,
    [cluster, i18n.language]
  )

  const nodeOptions = knowledgeMap.types?.[clusterType!]?.versions?.[
    clusterVersion!
  ]?.components.map((spec, idx) => (
    <NodeOptions
      t={t}
      key={spec.clusterComponent!.componentType!}
      idx={idx}
      spec={spec}
      region={region!}
      availableStocksMap={availableStocksMap}
      existed={topology.find(
        (tp) => tp.componentType === spec.clusterComponent!.componentType
      )}
    />
  ))

  const onReset = useCallback(() => {
    form.resetFields()
  }, [form])

  const columns = useMemo(() => getColumns(t), [i18n.language])

  const onSubmit = useCallback(async () => {
    const data = (await form.validateFields()) as {
      instanceResource: RawScaleOutResources[]
    }
    const diff = data.instanceResource.map((r) => findDiff(r))

    const applyScaleOut = () => {
      scaleOutCluster.mutateAsync(
        {
          payload: {
            clusterId: cluster.clusterId!,
            instanceResource: diff,
          },
          options: {
            actionName: t('name.scaleOut'),
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
          actionName: t('name.preview'),
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
      }
    )
  }, [
    previewScaleOutCluster.mutateAsync,
    scaleOutCluster.mutateAsync,
    form,
    i18n.language,
    cluster,
  ])

  const submitter = useMemo(
    () => <Submitter onSubmit={onSubmit} onReset={onReset} />,
    [onSubmit, onReset]
  )

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
      {submitter}
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
        <Descriptions.Item label={t('model:cluster.property.type')}>
          {cluster.clusterType}
        </Descriptions.Item>
        <Descriptions.Item label={t('model:cluster.property.version')}>
          {cluster.clusterVersion}
        </Descriptions.Item>
        <Descriptions.Item label={t('model:cluster.property.region')}>
          {cluster.region}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  )
}

function NodeOptions({
  t,
  spec,
  idx,
  region,
  availableStocksMap,
  existed,
}: {
  t: TFunction<''>
  spec: KnowledgeOfClusterComponent
  idx: number
  region: string
  availableStocksMap: AvailableStocksMap
  existed?: ClusterRawTopologyItem
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
          name={['instanceResource', idx, 'componentType']}
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
          <Col span={7}>{t('nodes.fields.zone')}</Col>
          <Col span={7}>{t('nodes.fields.spec')}</Col>
          <Col span={4}>{t('nodes.fields.oldAmount')}</Col>
          <Col span={4}>{t('nodes.fields.newAmount')}</Col>
        </Row>
        <Divider style={{ margin: '16px 0' }} />
        {(!!currentRegion && (
          <>
            {existed?.resource?.map((resource, i) => {
              // FIXME: zone code
              const zoneCode = `${region},${resource.zoneCode!}`
              const zone = currentRegion.map[zoneCode]
              if (specCodes.length === 0) return undefined
              return (
                !!zone && (
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
                        initialValue={zoneCode}
                        hidden
                      >
                        <Input />
                      </Form.Item>
                      <div className={styles.zoneName}>{zone.name}</div>
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
              )
            })}
            <Form.List name={['instanceResource', idx, 'appendResources']}>
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, fieldKey }) => (
                    <Row key={key} gutter={20}>
                      <Col span={7}>
                        <Form.Item
                          fieldKey={[fieldKey, 'zoneCode']}
                          name={[name, 'zoneCode']}
                          initialValue={currentRegion.zones[0]}
                        >
                          <Select>
                            {currentRegion.zones.map((zoneCode) => (
                              <Select.Option key={zoneCode} value={zoneCode}>
                                {currentRegion.map[zoneCode].name}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={7}>
                        <Form.Item
                          fieldKey={[fieldKey, 'specCode']}
                          name={[name, 'specCode']}
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
                          initialValue={suggestedNodeQuantity}
                        >
                          <InputNumber min={0} />
                        </Form.Item>
                      </Col>
                      <Col span={1}>
                        <Tooltip title={t('nodes.remove')}>
                          <MinusCircleOutlined
                            className={styles.removeBtn}
                            onClick={() => remove(name)}
                          />
                        </Tooltip>
                      </Col>
                    </Row>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      {t('nodes.add')}
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </>
        )) || <Empty description={t('message.noZone')} />}
      </Collapse.Panel>
    </Collapse>
  )
}

function Submitter({
  onReset,
  onSubmit,
}: {
  onReset: () => unknown
  onSubmit: () => unknown
}) {
  const { t } = useI18n()

  return (
    <div className={`${styles.submitter} ${styles.footer}`}>
      <IntlPopConfirm title={t('footer.reset.confirm')} onConfirm={onReset}>
        <Button size="large">{t('footer.reset.title')}</Button>
      </IntlPopConfirm>
      <Button size="large" type="primary" onClick={onSubmit}>
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
