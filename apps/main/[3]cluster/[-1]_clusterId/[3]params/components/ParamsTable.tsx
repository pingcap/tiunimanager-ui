import HeavyTable from '@/components/HeavyTable'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { ActionType, ProColumns } from '@ant-design/pro-table'
import { Button, Descriptions, Form, message, Modal, Popconfirm } from 'antd'
import {
  EditOutlined,
  ExclamationCircleOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  RollbackOutlined,
  SaveOutlined,
} from '@ant-design/icons'
import { APIS } from '@/api/client'
import { useAuthState } from '@store/auth'
import { ClusterapiClusterDisplayInfo, InstanceapiParamItem } from '#/api'

export interface ParamsTableProps {
  cluster: ClusterapiClusterDisplayInfo
}

const PAGE_SIZE = 40

export function ParamsTable({ cluster }: ParamsTableProps) {
  const [{ token }] = useAuthState()

  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)

  const [tableData, setTableData] = useState<InstanceapiParamItem[]>([])
  const [originData, setOriginData] = useState<InstanceapiParamItem[]>([])

  const ref = useRef<ActionType>()
  const [form] = Form.useForm()

  const columns: ProColumns<InstanceapiParamItem>[] = useMemo(
    () => [
      {
        title: '名称',
        width: 160,
        dataIndex: ['definition', 'name'],
        editable: false,
      },
      {
        title: '重启',
        width: 80,
        key: 'restart',
        render(_, record) {
          return record.definition!.needRestart! ? '是' : '否'
        },
        editable: false,
      },
      {
        title: '参数描述',
        dataIndex: ['definition', 'desc'],
        editable: false,
        ellipsis: true,
      },
      {
        title: '值范围',
        width: 200,
        key: 'range',
        render(_, record) {
          const constraints = record.definition!.constraints!
          const unit = record.definition!.unit!
          // TODO: handle different types
          return constraints.map((c) => `${c.contrastValue} ${unit}`).join(', ')
        },
        editable: false,
      },
      {
        title: '默认值',
        width: 160,
        dataIndex: ['definition', 'defaultValue'],
        editable: false,
      },
      {
        title: '运行值',
        width: 180,
        dataIndex: ['currentValue', 'value'],
        render(_, record, __, action) {
          return (
            <span
              onClick={() => {
                form.resetFields()
                action?.startEditable(record.definition!.name!)
              }}
              style={{ cursor: 'pointer' }}
            >
              <EditOutlined /> {record.currentValue!.value!}
            </span>
          )
        },
      },
      {
        title: '操作',
        valueType: 'option',
        width: 100,
        render: (_, record, __, action) => {
          return (
            <a
              key="editable"
              onClick={() => {
                form.resetFields()
                action?.startEditable?.(record.definition!.name!)
              }}
            >
              编辑
            </a>
          )
        },
      },
    ],
    [form]
  )

  async function fetchData() {
    setLoading(true)
    const { data } = await APIS.ClusterParams.paramsClusterIdPost(
      token,
      cluster.clusterId!,
      {
        // TODO: does page index start from 0?
        page: page,
        pageSize: PAGE_SIZE,
      }
    )

    // TODO: handle errors
    setTotal((data as any).page?.total || 0)
    setOriginData(data.data!)
    setTableData(data.data!)

    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [page])

  return (
    <HeavyTable
      // className={styles.clusterTable}
      loading={loading}
      dataSource={tableData}
      headerTitle={
        <Button key="refresh" onClick={() => fetchData()}>
          <ReloadOutlined /> 刷新
        </Button>
      }
      tooltip={false}
      columns={columns}
      pagination={{
        pageSize: PAGE_SIZE,
        total,
        showSizeChanger: false,
        onChange(page) {
          setPage(page)
        },
      }}
      options={{
        density: false,
        fullScreen: false,
        setting: false,
        reload: false,
      }}
      rowKey={(record) => record.definition!.name!}
      actionRef={ref}
      toolBarRender={() => [
        <Popconfirm
          key="reset"
          title="确认重置本地修改吗"
          icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
          onConfirm={() => {
            setTableData(originData)
          }}
        >
          <Button>
            <RollbackOutlined /> 重置
          </Button>
        </Popconfirm>,
        <Button
          type="primary"
          key="submit"
          onClick={() => {
            const changes = findParamsChanges(originData, tableData)
            if (changes.length === 0) {
              message.info('没有任何更改')
            } else {
              Modal.confirm({
                title: '确认保存以下参数更改吗?',
                icon: <ExclamationCircleOutlined />,
                width: 600,
                content: (
                  <Descriptions size="middle" column={3}>
                    {changes.map((change) => (
                      <Fragment key={change.name}>
                        <Descriptions.Item label="名称">
                          {change.name}
                        </Descriptions.Item>
                        <Descriptions.Item label="原始值">
                          {change.change[0]}
                        </Descriptions.Item>
                        <Descriptions.Item label="修改值">
                          {change.change[1]}
                        </Descriptions.Item>
                      </Fragment>
                    ))}
                  </Descriptions>
                ),
                async onOk() {
                  try {
                    await APIS.ClusterParams.paramsSubmitPost(token, {
                      clusterId: cluster.clusterId,
                      values: changes.map((change) => ({
                        name: change.name,
                        value: change.change[1],
                      })),
                    })
                    message.info('保存配置成功')
                    fetchData()
                  } catch (e) {
                    message.error(
                      `保存配置失败: ${
                        (e.response?.data?.message ?? e) || '未知原因'
                      }`
                    )
                  }
                },
              })
            }
          }}
        >
          <SaveOutlined /> 保存更改
        </Button>,
      ]}
      editable={{
        type: 'single',
        form,
        actionRender(_, __, dom) {
          return [dom.save, dom.cancel]
        },
        onValuesChange(_, list) {
          setTableData(list)
        },
        async onSave(_, row) {
          // TODO: handle different type
          if ((row.currentValue!.value! as any) === '') {
            row.currentValue!.value = row.definition!.defaultValue
          }
        },
      }}
    />
  )
}

function findParamsChanges(
  origin: InstanceapiParamItem[],
  table: InstanceapiParamItem[]
) {
  const changes: {
    name: string
    change: [any, any]
  }[] = []
  origin.forEach((raw, i) => {
    if (raw.currentValue!.value !== table[i].currentValue!.value) {
      changes.push({
        name: raw.definition!.name!,
        change: [raw.currentValue!.value!, table[i].currentValue!.value!],
      })
    }
  })
  return changes
}
