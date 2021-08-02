import {
  Button,
  Col,
  Divider,
  Drawer,
  Form,
  Input,
  InputNumber,
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
  ModelsClusterComponentSpec,
  ModelsClusterType,
  ModelsClusterTypeSpec,
  ModelsClusterVersion,
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
  types: ModelsClusterType[]
  map: {
    [typeCode: string]: {
      versions: ModelsClusterVersion[]
      map: {
        [versionCode: string]: ModelsClusterComponentSpec[]
      }
    }
  }
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

  useEffect(() => {
    async function transformKnowledge() {
      const knowledge = await getKnowledge(token)
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
      const result = {
        types: knowledge.map((t) => t.clusterType!),
        map: typeMapToVersions,
      }
      setKnowledgeMap(result)
      const defaultClusterType = result.types[0].code
      setClusterType(defaultClusterType)
      defaultClusterType &&
        setClusterVersion(result.map[defaultClusterType].versions[0].code)
    }

    transformKnowledge()
  }, [token])

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
          <Form.Item name="tags" label="集群标签">
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
    knowledgeMap.map?.[clusterType!]?.map?.[clusterVersion!]?.map(
      (spec, idx) => (
        <Col span={12} key={spec.clusterComponent!.componentType!}>
          <Divider>{spec.clusterComponent!.componentName!} 配置</Divider>
          <Form.Item
            name={['nodeDemandList', idx, 'componentType']}
            hidden
            initialValue={spec.clusterComponent!.componentType!}
          >
            <Input />
          </Form.Item>
          {/*{spec.componentConstraint?.availableSpecCodes}*/}
          {/*// TODO: get spec and region from hosts api*/}
          {['regionA', 'regionB'].map((region, i) => (
            <Row key={i}>
              <Form.Item
                name={['nodeDemandList', idx, 'componentType', i, 'specCode']}
                initialValue={region}
                hidden
              >
                <Input />
              </Form.Item>
              <Form.Item
                name={['nodeDemandList', idx, 'componentType', i, 'zoneCode']}
                initialValue={region}
                hidden
              >
                <Input />
              </Form.Item>
              <Form.Item
                name={['nodeDemandList', idx, 'componentType', i, 'count']}
                initialValue={1}
              >
                <InputNumber />
              </Form.Item>
            </Row>
          ))}
        </Col>
      )
    )

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
          <div>简略概要</div>
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
                  // TODO: use react-query
                  await APIS.Cluster.clusterPost(token, fields)
                  // TODO: show notification and fresh table for new instance
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
        <Row gutter={30}>
          {basicOptions}
          {nodeOptions}
        </Row>
      </Form>
    </Drawer>
  )
}
