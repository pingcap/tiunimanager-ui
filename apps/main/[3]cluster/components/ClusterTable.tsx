import { ActionType, ColumnsState, ProColumns } from '@ant-design/pro-table'
import { APIS } from '@/api/client'
import { Fragment, useEffect, useRef, useState } from 'react'
import { Button, message, Popconfirm, Progress, Tooltip } from 'antd'
import { PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import styles from './ClusterTable.module.less'
import { useAuthState } from '@store/auth'
import useToggle from '@hooks/useToggle'
import HeavyTable from '@/components/HeavyTable'
import { CreatePanel } from '@apps/main/[3]cluster/components/CreatePanel'
import {
  ClusterapiClusterDisplayInfo,
  ControllerUsage,
  KnowledgeClusterTypeSpec,
} from '#/api'
import { CopyIconButton } from '@/components/CopyToClipboard'
import useLocalStorage from '@hooks/useLocalstorage'
import { getKnowledge } from '@store/knowledge'
import { Link } from 'react-router-dom'

function getUsageCircle(
  { total, usageRate, used }: Required<ControllerUsage>,
  name: string,
  unit: string
) {
  return (
    <Tooltip title={`${used} / ${total} ${unit}, ${usageRate}%`}>
      <Progress
        type="circle"
        width={40}
        percent={usageRate * 100}
        size="small"
        format={() => name}
        status={
          usageRate > 0.8 ? 'exception' : usageRate > 0.4 ? 'normal' : 'success'
        }
      />
    </Tooltip>
  )
}

function getClusterTypes(raw: KnowledgeClusterTypeSpec[]) {
  const result = Object.create(null)
  raw.forEach(
    (r) =>
      (result[r.clusterType!.code!] = {
        text: r.clusterType!.name!,
      })
  )
  return result
}

async function getColumns(
  token: string
): Promise<ProColumns<ClusterapiClusterDisplayInfo>[]> {
  const knowledge = await getKnowledge(token)
  const clusterTypesEnum = getClusterTypes(knowledge)
  return [
    {
      title: 'ID',
      width: 180,
      dataIndex: 'clusterId',
      key: 'clusterId',
      render: (_, record) => (
        <Link to={`/cluster/${record.clusterId}`}>{record.clusterId}</Link>
      ),
    },
    {
      title: '名称',
      width: 120,
      dataIndex: 'clusterName',
      key: 'clusterName',
    },
    {
      title: '状态',
      width: 100,
      dataIndex: 'statusCode',
      key: 'statusCode',
      // TODO: i18n
      valueType: 'select',
      valueEnum: {
        '0': { text: '未上线', status: 'Default' },
        '1': { text: '运行中', status: 'Processing' },
        '2': { text: '已下线', status: 'Warning' },
        '3': { text: '已删除', status: 'Default' },
      },
    },
    {
      title: '连接地址',
      width: 160,
      dataIndex: 'extranetConnectAddresses',
      key: 'extranetConnectAddresses',
      hideInSearch: true,
      render(dom, record) {
        // TODO: extranet & intranet connect address
        return (
          <span className={styles.addressContainer}>
            {[
              ...(record.extranetConnectAddresses || []),
              ...(record.intranetConnectAddresses || []),
            ].map((a) => (
              <span key={a}>
                <CopyIconButton
                  text={a}
                  tip="复制连接地址"
                  message={`${a} 复制成功`}
                />{' '}
                {a}
              </span>
            ))}
          </span>
        )
      },
    },
    {
      title: '密码',
      width: 60,
      dataIndex: 'dbPassword',
      key: 'dbPassword',
      hideInSearch: true,
      render(_, record) {
        return record.dbPassword ? (
          <span>
            <CopyIconButton
              text={record.dbPassword}
              tip="复制密码"
              message="复制成功"
            />
          </span>
        ) : (
          ''
        )
      },
    },
    {
      title: '标签',
      width: 120,
      key: 'tags',
      render(_, record) {
        return (
          <>
            {record.tags?.map((tag) => (
              <Fragment key={tag}>
                <span>{tag}</span>
                <br />
              </Fragment>
            ))}
          </>
        )
      },
    },
    {
      title: '端口',
      width: 60,
      dataIndex: 'port',
      key: 'port',
      hideInSearch: true,
    },
    {
      title: '版本',
      width: 60,
      dataIndex: 'clusterVersion',
      key: 'clusterVersion',
      hideInSearch: true,
    },
    {
      title: '类型',
      width: 60,
      dataIndex: 'clusterType',
      key: 'clusterType',
      valueType: 'select',
      valueEnum: clusterTypesEnum,
    },
    {
      title: '创建时间',
      width: 180,
      dataIndex: 'createTime',
      key: 'createTime',
      hideInSearch: true,
      valueType: 'dateTime',
    },
    {
      title: '更新时间',
      width: 180,
      dataIndex: 'updateTime',
      key: 'updateTime',
      hideInSearch: true,
      valueType: 'dateTime',
    },
    {
      title: '删除时间',
      width: 180,
      dataIndex: 'deleteTime',
      key: 'deleteTime',
      hideInSearch: true,
      valueType: 'dateTime',
    },
    {
      title: 'TLS',
      width: 60,
      dataIndex: 'tls',
      key: 'tls',
      hideInSearch: true,
      render(_, record) {
        return record ? '启用' : '无'
      },
    },
    {
      title: '资源使用率',
      key: 'usage',
      width: 300,
      hideInSearch: true,
      render(dom, record) {
        // TODO: what unit is
        return (
          <span className={styles.usageCircleContainer}>
            {record.cpuUsage &&
              getUsageCircle(
                record.cpuUsage as Required<ControllerUsage>,
                'CPU',
                ''
              )}
            {record.memoryUsage &&
              getUsageCircle(
                record.memoryUsage as Required<ControllerUsage>,
                '内存',
                'MB'
              )}
            {record.diskUsage &&
              getUsageCircle(
                record.diskUsage as Required<ControllerUsage>,
                '磁盘',
                'MB'
              )}
            {record.backupFileUsage &&
              getUsageCircle(
                record.backupFileUsage as Required<ControllerUsage>,
                '备份',
                'MB'
              )}
            {record.storageUsage &&
              getUsageCircle(
                record.storageUsage as Required<ControllerUsage>,
                '存储',
                'MB'
              )}
          </span>
        )
      },
    },
    {
      title: '操作',
      width: 140,
      key: 'actions',
      valueType: 'option',
      render(_, record, i, action) {
        return [
          // TODO: implement actions in cluster list
          <a key="edit">修改</a>,
          <a key="reboot">重启</a>,
          <Popconfirm
            key="delete"
            title="确认删除该集群吗"
            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
            onConfirm={async () => {
              try {
                await APIS.Cluster.clusterClusterIdDelete(
                  token,
                  record.clusterId!
                )
                message.success(`删除集群 ${record.clusterName} 成功`)
                // TODO: update record or re-fetch?
                action?.reload()
              } catch (e) {
                message.error(
                  `删除失败: ${(e.response?.data?.message ?? e) || '未知原因'}`
                )
              }
            }}
          >
            <a className="danger-link">删除</a>
          </Popconfirm>,
        ]
      },
    },
  ]
}

const defaultColumnsSetting: Record<string, ColumnsState> = {
  updateTime: {
    show: false,
  },
  deleteTime: {
    show: false,
  },
  tls: {
    show: false,
  },
  dbPassword: {
    show: false,
  },
  actions: {
    fixed: 'right',
  },
}

export default function ClusterTable() {
  const [{ token }] = useAuthState()
  const [total, setTotal] = useState(0)
  const [createFormVisible, toggleCreateFormVisible] = useToggle(false)
  const ref = useRef<ActionType>()
  const [columnsSetting, setColumnSetting] = useLocalStorage(
    'cluster-table-show',
    defaultColumnsSetting
  )

  const [columns, setColumns] = useState<
    ProColumns<ClusterapiClusterDisplayInfo>[]
  >([])

  useEffect(() => {
    getColumns(token).then((result) => setColumns(result))
  }, [token])

  return (
    <>
      <HeavyTable
        className={styles.clusterTable}
        headerTitle={
          <Button
            type="primary"
            key="create"
            onClick={() => toggleCreateFormVisible()}
          >
            <PlusOutlined /> 创建集群
          </Button>
        }
        tooltip={false}
        columns={columns}
        pagination={{
          pageSize: 15,
          total,
          showSizeChanger: false,
        }}
        columnsStateMap={columnsSetting}
        onColumnsStateChange={(m) => setColumnSetting(m)}
        rowKey="clusterId"
        actionRef={ref}
        search={{
          filterType: 'light',
        }}
        request={async ({ current, pageSize, ...params }) => {
          // TODO: Use react-query instead.
          const resp = await APIS.Cluster.clusterQueryPost(token, {
            ...params,
            // TODO: does page index start from 0?
            page: (current || 1) - 1,
            pageSize: pageSize,
          })

          setTotal((resp.data as any).page?.total || 0)

          // TODO: handle errors
          return {
            data: resp.data.data,
            success: true,
          }
        }}
      />
      <CreatePanel
        onCreated={() => ref.current?.reload()}
        onClose={() => toggleCreateFormVisible()}
        visible={createFormVisible}
      />
    </>
  )
}
