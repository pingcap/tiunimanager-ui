import {
  Button,
  Col,
  Divider,
  Drawer,
  Dropdown,
  Form,
  Input,
  InputNumber,
  Menu,
  message,
  Popconfirm,
  Row,
  Select,
  Switch,
} from 'antd'
import { CSSProperties, useEffect, useState } from 'react'

import styles from './CreatePanel.module.less'
import { APIS } from '@/api/client'
import { useAuthState } from '@store/auth'
import { ArrowRightOutlined } from '@ant-design/icons'
import {
  ClusterapiCreateReq,
  HostapiDomainResource,
  KnowledgeClusterComponentSpec,
  KnowledgeClusterType,
  KnowledgeClusterTypeSpec,
  KnowledgeClusterVersion,
} from '#/api'
import { getKnowledge } from '@store/knowledge'

// TODO: i18n for create instance form

export interface CreatePanelProps {
  onClose: () => void
  onCreated: () => void
  visible: boolean
  bodyStyle?: CSSProperties
}

type KnowledgeMap = {
  types: KnowledgeClusterType[]
  map: {
    [typeCode: string]: {
      versions: KnowledgeClusterVersion[]
      map: {
        [versionCode: string]: KnowledgeClusterComponentSpec[]
      }
    }
  }
}

function transformKnowledgeMap(
  knowledge: KnowledgeClusterTypeSpec[]
): KnowledgeMap {
  const typeMapToVersions: KnowledgeMap['map'] = Object.create(null)
  knowledge.forEach((t) => {
    const versionMapToSpecs = Object.create(null)
    t.versionSpecs!.forEach((s) => {
      versionMapToSpecs[s.clusterVersion!.code!] = s.componentSpecs
    })
    typeMapToVersions[t.clusterType!.code!] = {
      versions: t.versionSpecs!.map((p) => p.clusterVersion!),
      map: versionMapToSpecs,
    }
  })
  return {
    types: knowledge.map((t) => t.clusterType!),
    map: typeMapToVersions,
  }
}

type AvailableStocksMap = {
  zones: string[]
  map: {
    [zoneCode: string]: {
      zoneCode: string
      zoneName: string
      specs: {
        specCode: string
        specName: string
        count: number
      }[]
    }
  }
}

function transformAvailableStocksMap(
  domainResources: HostapiDomainResource[]
): AvailableStocksMap {
  const result: AvailableStocksMap = Object.create(null)
  result.zones = []
  result.map = {}
  domainResources.forEach((rs) => {
    // TODO: ignore purpose in sprint 1
    if (!result.zones.includes(rs.zoneCode!)) {
      result.zones.push(rs.zoneCode!)
      result.map[rs.zoneCode!] = {
        zoneCode: rs.zoneCode!,
        zoneName: rs.zoneName!,
        specs: [],
      }
    }
    result.map[rs.zoneCode!].specs.push({
      specCode: rs.specCode!,
      specName: rs.specName!,
      count: rs.count!,
    })
  })
  return result
}

function allocateNodes(targetCount: number, zoneCount: number) {
  const every = Math.floor(targetCount / zoneCount)
  const rest = targetCount - zoneCount * every
  return Array.from(
    {
      length: zoneCount,
    },
    (_, i) => (i < rest ? every + 1 : every)
  )
}

export function CreatePanel({
  onClose,
  visible,
  bodyStyle,
  onCreated,
}: CreatePanelProps) {
  const [{ token }] = useAuthState()

  const [form] = Form.useForm()

  const close = () => {
    onClose()
    form.resetFields()
  }

  const [knowledgeMap, setKnowledgeMap] = useState<KnowledgeMap>()
  const [availableStocksMap, setAvailableStocksMap] =
    useState<AvailableStocksMap>()

  useEffect(() => {
    async function fetchKnowledgeMap() {
      const knowledge = await getKnowledge(token)
      const result = transformKnowledgeMap(knowledge)
      setKnowledgeMap(result)
      const defaultClusterType = result.types[0].code
      setClusterType(defaultClusterType)
      defaultClusterType &&
        setClusterVersion(result.map[defaultClusterType].versions[0].code)
    }

    fetchKnowledgeMap()
  }, [token])

  useEffect(() => {
    // update available stocks when open panel
    if (visible) {
      APIS.Resource.failuredomainsGet(token).then(({ data }) => {
        setAvailableStocksMap(transformAvailableStocksMap(data.data!))
      })
    }
  }, [token, visible])

  const [clusterType, setClusterType] = useState<string>()
  const [clusterVersion, setClusterVersion] = useState<string>()

  const basicOptions = knowledgeMap && (
    <Col span={24}>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="clusterName"
            label="集群名称"
            tooltip="大小写字母、数字和连字符，并以字母开头，长度8-32位"
            rules={[
              { required: true, message: '请输入集群名称' },
              { min: 8, max: 32, message: '长度须达到8-32位' },
            ]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="tags" label="集群标签" initialValue="">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="dbPassword"
            label="数据库密码"
            tooltip="大小写，可见特殊字符(!@#$%^&*()_+=)，数字三种以上组合，长度8-32位"
            rules={[
              { required: true, message: '请输入数据库密码' },
              { min: 8, max: 32, message: '长度须达到8-32位' },
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="集群属性">
            <Input.Group compact>
              <Form.Item
                name="clusterType"
                noStyle
                rules={[{ required: true, message: '请选择集群类型' }]}
                initialValue={clusterType}
              >
                <Select
                  onSelect={(key) => {
                    setClusterType(key as string)
                    const defaultVersion =
                      knowledgeMap.map[key as string].versions[0].code
                    // for reset
                    setClusterVersion(defaultVersion)
                    // refresh
                    form.setFields([
                      {
                        name: 'clusterVersion',
                        value: defaultVersion,
                      },
                    ])
                  }}
                >
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
                rules={[{ required: true, message: '请选择集群版本' }]}
                initialValue={clusterVersion}
              >
                <Select onSelect={(key) => setClusterVersion(key as string)}>
                  {!!clusterType &&
                    knowledgeMap.map[clusterType].versions.map((v) => (
                      <Select.Option value={v.code!} key={v.code!}>
                        {v.name!}
                      </Select.Option>
                    ))}
                </Select>
              </Form.Item>
            </Input.Group>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="tls"
            label="启用TLS"
            tooltip="TODO"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Col>
      </Row>
    </Col>
  )

  const nodeOptions =
    knowledgeMap &&
    availableStocksMap &&
    knowledgeMap.map?.[clusterType!]?.map?.[clusterVersion!]?.map(
      (spec, idx) => {
        const componentName = spec.clusterComponent!.componentName!
        const componentType = spec.clusterComponent!.componentType!
        const suggestedNodeQuantities =
          spec.componentConstraint?.suggestedNodeQuantities
        const availableSpecCodes = spec.componentConstraint?.availableSpecCodes

        return (
          <Col span={12} key={spec.clusterComponent!.componentType!}>
            <Divider />
            <Row className={styles.quickSelector}>
              <h3>{componentName} 配置</h3>
              <Dropdown.Button
                disabled={!suggestedNodeQuantities?.length}
                overlay={
                  <Menu
                    onClick={(e) => {
                      form.setFields(
                        allocateNodes(
                          Number.parseInt(e.key),
                          availableStocksMap.zones.length
                        ).map((count, i) => ({
                          name: [
                            'nodeDemandList',
                            idx,
                            'distributionItems',
                            i,
                            'count',
                          ],
                          value: count,
                        }))
                      )
                    }}
                  >
                    {suggestedNodeQuantities?.map((q) => (
                      <Menu.Item key={q}>{q} 节点</Menu.Item>
                    ))}
                  </Menu>
                }
              >
                快速选择
              </Dropdown.Button>
            </Row>
            <Form.Item
              name={['nodeDemandList', idx, 'componentType']}
              hidden
              initialValue={componentType}
            >
              <Input />
            </Form.Item>
            {availableStocksMap.zones.map((zoneCode, i) => {
              const zone = availableStocksMap.map[zoneCode]
              const specs = zone.specs.filter((spec) =>
                availableSpecCodes!.includes(spec.specCode)
              )
              if (specs.length === 0) return undefined
              return (
                <Row key={i} gutter={20}>
                  <Col span={8}>
                    <Form.Item
                      name={[
                        'nodeDemandList',
                        idx,
                        'distributionItems',
                        i,
                        'zoneCode',
                      ]}
                      initialValue={zoneCode}
                      hidden
                    >
                      <Input />
                    </Form.Item>
                    <div className={styles.zoneName}>{zone.zoneName}</div>
                  </Col>
                  <Col span={10}>
                    <Form.Item
                      name={[
                        'nodeDemandList',
                        idx,
                        'distributionItems',
                        i,
                        'specCode',
                      ]}
                      initialValue={specs[0].specCode}
                    >
                      <Select>
                        {specs.map((spec) => (
                          <Select.Option
                            key={spec.specCode}
                            value={spec.specCode}
                          >
                            {spec.specName}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      name={[
                        'nodeDemandList',
                        idx,
                        'distributionItems',
                        i,
                        'count',
                      ]}
                      initialValue={1}
                    >
                      <InputNumber
                        min={0}
                        // TODO: add max limit
                      />
                    </Form.Item>
                  </Col>
                </Row>
              )
            })}
          </Col>
        )
      }
    )

  async function handleCreate(value: ClusterapiCreateReq) {
    value.nodeDemandList?.forEach((comp) => {
      // remove count=0
      comp.distributionItems = comp.distributionItems!.filter(
        (item) => item.count! > 0
      )
      // calculate totalCount
      comp.totalNodeCount = comp.distributionItems!.reduce(
        (count, item) => count + item.count!,
        0
      )
    })
    const specs =
      knowledgeMap!.map[value.clusterType!].map![value.clusterVersion!]
    for (const spec of specs) {
      const node = value.nodeDemandList!.find(
        (n) => n.componentType === spec.clusterComponent!.componentType
      )!
      const required = spec.componentConstraint!.componentRequired
      const minZone = spec.componentConstraint!.minZoneQuantity
      // check exist if required
      if (required) {
        if (node.totalNodeCount! === 0) {
          message.error(
            `不能缺失 ${spec.clusterComponent!.componentName} 节点!`
          )
          return Promise.reject()
        }
      }
      // check min zone quantity
      if (minZone) {
        if (node.distributionItems!.length! < minZone) {
          message.error(
            `${
              spec.clusterComponent!.componentName
            } 至少需要 ${minZone} 个不同 Zone 的节点!`
          )
          return Promise.reject()
        }
      }
    }
    // TODO: use react-query
    const { data } = await APIS.Cluster.clusterPost(token, value)
    message.success(`集群 ${data.data!.clusterName} 创建成功`)
    return Promise.resolve()
  }

  return (
    <Drawer
      className={styles.panel}
      title="创建集群"
      width={960}
      onClose={close}
      closeIcon={<ArrowRightOutlined />}
      visible={visible}
      bodyStyle={{
        paddingTop: 0,
        ...bodyStyle,
      }}
      maskClosable={false}
      footer={
        <div className={styles.footer}>
          <div>{/*简略概要*/}</div>
          <div>
            <Popconfirm
              title="确认重置表单吗"
              onConfirm={() => {
                form.resetFields()
              }}
            >
              <Button size="large">重置</Button>
            </Popconfirm>
            <Button
              size="large"
              onClick={async () => {
                try {
                  const fields = await form.validateFields()
                  await handleCreate(fields)
                  close()
                  onCreated()
                } catch (e) {
                  // TODO: show err message
                }
              }}
              type="primary"
            >
              创建
            </Button>
          </div>
        </div>
      }
    >
      <Form
        layout="horizontal"
        hideRequiredMark
        labelCol={{
          span: 6,
        }}
        colon={false}
        form={form}
        name="create"
        className={styles.form}
      >
        <Row gutter={48}>
          {basicOptions}
          {nodeOptions}
        </Row>
      </Form>
    </Drawer>
  )
}
