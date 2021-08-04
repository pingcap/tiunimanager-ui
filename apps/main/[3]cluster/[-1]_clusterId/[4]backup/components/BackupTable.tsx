import { ActionType, ColumnsState, ProColumns } from '@ant-design/pro-table'
import { useAuthState } from '@store/auth'
import { useEffect, useRef, useState } from 'react'
import useToggle from '@hooks/useToggle'
import useLocalStorage from '@hooks/useLocalstorage'
import { ClusterapiClusterDisplayInfo, InstanceapiBackupRecord } from '#/api'
import HeavyTable from '@/components/HeavyTable'
import styles from '@apps/main/[3]cluster/components/ClusterTable.module.less'
import { Button, message, Popconfirm } from 'antd'
import { QuestionCircleOutlined, SettingOutlined } from '@ant-design/icons'
import { APIS } from '@/api/client'
import SettingPanel from '@apps/main/[3]cluster/[-1]_clusterId/[4]backup/components/SettingPanel'

// TODO: enum i18n
const BACKUP_RANGE_ENUM: Record<number, string> = {
  0: '全量',
  1: '增量',
}
const BACKUP_WAY_ENUM: Record<number, string> = {
  0: '逻辑',
  1: '物理',
}

function getColumns(token: string): ProColumns<InstanceapiBackupRecord>[] {
  return [
    {
      title: 'ID',
      width: 120,
      dataIndex: 'id',
      key: 'id',
      hideInSearch: true,
    },
    {
      title: '起始时间',
      width: 120,
      dataIndex: 'startTime',
      key: 'startTime',
      valueType: 'dateTime',
    },
    {
      title: '截至时间',
      width: 120,
      dataIndex: 'endTime',
      key: 'endTime',
      valueType: 'dateTime',
    },
    {
      title: '方法',
      width: 80,
      dataIndex: 'way',
      key: 'way',
      hideInSearch: true,
    },
    {
      title: '备份类型',
      width: 80,
      key: 'backupType',
      hideInSearch: true,
      render: (_, record) =>
        `${BACKUP_RANGE_ENUM[record.range!]} ${BACKUP_WAY_ENUM[record.way!]}`,
    },
    {
      title: '备份方式',
      width: 80,
      key: 'backupMethod',
      hideInSearch: true,
      render: (_, record) =>
        // TODO: add i18n for manual operator
        record.operator?.manualOperator ? '手动' : '自动',
    },
    {
      title: '操作人',
      width: 80,
      dataIndex: ['operator', 'operatorName'],
      key: 'operator',
      hideInSearch: true,
    },
    {
      title: '空间占用',
      width: 100,
      key: 'size',
      hideInSearch: true,
      render: (_, record) => `${record.size} MB`,
    },
    {
      title: '状态',
      width: 80,
      dataIndex: ['status', 'statusName'],
      key: 'status',
      hideInSearch: true,
    },
    {
      title: '文件路径',
      width: 180,
      dataIndex: 'filePath',
      key: 'filePath',
      hideInSearch: true,
    },
    {
      title: '操作',
      width: 80,
      key: 'actions',
      valueType: 'option',
      render(_, record, i, action) {
        return [
          <Popconfirm
            key="recover"
            title="确认从该备份还原吗"
            icon={<QuestionCircleOutlined />}
            onConfirm={async () => {
              try {
                await APIS.ClusterBackup.backupRecordRecoverPost(token, {
                  clusterId: record.clusterId,
                  backupRecordId: record.id,
                })
                message.success(`创建备份还原任务成功`)
                action?.reload()
              } catch (e) {
                message.error(
                  `创建备份还原任务败: ${
                    (e.response?.data?.message ?? e) || '未知原因'
                  }`
                )
              }
            }}
          >
            <a>还原</a>
          </Popconfirm>,
          <Popconfirm
            key="delete"
            title="确认删除该备份吗"
            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
            onConfirm={async () => {
              try {
                await APIS.ClusterBackup.backupRecordRecordIdDelete(
                  token,
                  // TODO: remove as any
                  record.id! as any
                )
                message.success(`删除备份 ${record.id} 成功`)
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
  id: {
    show: false,
  },
  operator: {
    show: false,
  },
  actions: {
    fixed: 'right',
  },
}

export interface BackupTableProps {
  cluster: ClusterapiClusterDisplayInfo
}

export default function BackupTable({ cluster }: BackupTableProps) {
  const [{ token }] = useAuthState()
  const [total, setTotal] = useState(0)
  const [settingVisible, toggleSettingVisible] = useToggle(false)
  const ref = useRef<ActionType>()
  const [columnsSetting, setColumnSetting] = useLocalStorage(
    'backup-table-show',
    defaultColumnsSetting
  )

  const [columns, setColumns] = useState<ProColumns<InstanceapiBackupRecord>[]>(
    []
  )

  useEffect(() => {
    setColumns(getColumns(token))
  }, [token])

  return (
    <>
      <HeavyTable
        className={styles.clusterTable}
        headerTitle={
          <Button
            type="primary"
            key="create"
            onClick={() => toggleSettingVisible()}
          >
            <SettingOutlined /> 设置
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
          const resp = await APIS.ClusterBackup.backupRecordsClusterIdPost(
            token,
            cluster.clusterId!,
            {
              ...params,
              // TODO: does page index start from 0?
              page: (current || 1) - 1,
              pageSize: pageSize,
            }
          )

          setTotal((resp.data as any).page?.total || 0)

          // TODO: handle errors
          return {
            data: resp.data.data,
            success: true,
          }
        }}
      />
      <SettingPanel
        onClose={() => toggleSettingVisible()}
        cluster={cluster}
        visible={settingVisible}
      />
    </>
  )
}
