import { ColumnsState, ProColumns } from '@ant-design/pro-table'
import { useCallback, useMemo, useState } from 'react'
import { ClusterBackupItem, ClusterInfo, PagedResult } from '@/api/model'
import HeavyTable from '@/components/HeavyTable'
import { message, Popconfirm } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'
import {
  invalidateClusterBackups,
  useDeleteClusterBackup,
  useQueryClusterBackups,
} from '@/api/hooks/cluster'
import { loadI18n, useI18n } from '@i18n-macro'
import { useQueryClient } from 'react-query'
import styles from './index.module.less'
import { errToMsg } from '@/utils/error'
import { TFunction } from 'react-i18next'
import { getTimestamp } from '@/utils/time'
import { usePagination } from '@hooks/usePagination'
import { DeleteConfirm } from '@/components/DeleteConfirm'
import { resolveRoute } from '@pages-macro'
import { useHistory } from 'react-router-dom'

loadI18n()

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
  cluster: ClusterInfo
}

export default function BackupTable({ cluster }: BackupTableProps) {
  const {
    data,
    refetch,
    isLoading,
    isPreviousData,
    setPagination,
    pagination,
    setFilter,
  } = useFetchBackupData(cluster.clusterId!)

  const columns = useTableColumn({
    cluster,
  })

  return (
    <HeavyTable
      loading={isLoading}
      dataSource={data?.data.data || []}
      className={styles.backupTable}
      headerTitle={null}
      onSubmit={(filters) => {
        const { startTime, endTime } = filters as {
          startTime?: string
          endTime?: string
        }
        setFilter({
          startTime: startTime ? getTimestamp(startTime) : undefined,
          endTime: endTime ? getTimestamp(endTime) : undefined,
        })
      }}
      tooltip={false}
      columns={columns}
      pagination={{
        pageSize: pagination.pageSize,
        current: pagination.page,
        total: (data?.data as PagedResult)?.page?.total || 0,
        onChange(page, pageSize) {
          if (!isPreviousData)
            setPagination({ page, pageSize: pageSize || pagination.pageSize })
        },
      }}
      columnsState={{
        persistenceKey: 'backup-table-show',
        defaultValue: defaultColumnsSetting,
      }}
      rowKey="id"
      search={{
        filterType: 'light',
      }}
      options={{
        reload: () => refetch(),
      }}
    />
  )
}

function useFetchBackupData(clusterId: string) {
  const [pagination, setPagination] = usePagination()
  const [filters, setFilter] = useState<{
    startTime?: number
    endTime?: number
  }>({
    startTime: undefined,
    endTime: undefined,
  })
  const { data, isLoading, isPreviousData, refetch } = useQueryClusterBackups(
    {
      id: clusterId,
      ...pagination,
      ...filters,
    },
    { keepPreviousData: true }
  )
  return {
    pagination,
    setPagination,
    data,
    isPreviousData,
    setFilter,
    isLoading,
    refetch,
  }
}

function useTableColumn({ cluster }: { cluster: ClusterInfo }) {
  const clusterId = cluster.clusterId!
  const { t, i18n } = useI18n()
  const history = useHistory()

  const deleteBackup = useDeleteClusterBackup()
  const queryClient = useQueryClient()
  const deleteAction = useCallback(
    (backupId) =>
      deleteBackup.mutateAsync(
        { backupId, clusterId },
        {
          onSuccess(data) {
            message.success(t('delete.success', { msg: data.data.data })).then()
          },
          onSettled() {
            return invalidateClusterBackups(queryClient, clusterId)
          },
          onError(e: any) {
            message
              .error(
                t('delete.fail', {
                  msg: errToMsg(e),
                })
              )
              .then()
          },
        }
      ),
    [queryClient, deleteBackup.mutateAsync, clusterId]
  )

  const restoreAction = useCallback(
    (backup: ClusterBackupItem) => {
      history.push({
        pathname: resolveRoute('../../restore'),
        state: { backup, cluster },
      })
    },
    [history, cluster]
  )

  return useMemo(
    () => getColumns(t, restoreAction, deleteAction),
    [i18n.language, deleteAction]
  )
}

function getColumns(
  t: TFunction<''>,
  restoreAction: (backup: ClusterBackupItem) => any,
  deleteAction: (backupId: number) => any
): ProColumns<ClusterBackupItem>[] {
  return [
    {
      title: 'ID',
      width: 120,
      dataIndex: 'id',
      key: 'id',
      hideInSearch: true,
    },
    {
      title: t('model:clusterBackup.property.startTime'),
      width: 120,
      dataIndex: 'startTime',
      key: 'startTime',
      valueType: 'dateTime',
    },
    {
      title: t('model:clusterBackup.property.endTime'),
      width: 120,
      dataIndex: 'endTime',
      key: 'endTime',
      valueType: 'dateTime',
    },
    {
      title: t('model:clusterBackup.property.tso'),
      width: 140,
      dataIndex: 'backupTso',
      key: 'backupTso',
      hideInSearch: true,
    },
    {
      title: t('model:clusterBackup.property.type'),
      width: 60,
      key: 'type',
      hideInSearch: true,
      render: (_, record) =>
        t(`model:clusterBackup.type.${record.backupType!}`),
    },
    {
      title: t('model:clusterBackup.property.method'),
      width: 60,
      key: 'method',
      hideInSearch: true,
      render: (_, record) =>
        t(`model:clusterBackup.method.${record.backupMethod!}`),
    },
    {
      title: t('model:clusterBackup.property.mode'),
      width: 60,
      key: 'mode',
      hideInSearch: true,
      render: (_, record) => t(`model:clusterBackup.mode.${record.backupMode}`),
    },
    {
      title: t('model:clusterBackup.property.operator'),
      width: 80,
      dataIndex: ['operator', 'operatorName'],
      key: 'operator',
      hideInSearch: true,
    },
    {
      title: t('model:clusterBackup.property.size'),
      width: 100,
      key: 'size',
      hideInSearch: true,
      render: (_, record) => (record.size! < 0 ? '-' : `${record.size} MB`),
    },
    {
      title: t('model:clusterBackup.property.status'),
      width: 80,
      dataIndex: ['status', 'statusName'],
      key: 'status',
      hideInSearch: true,
    },
    {
      title: t('model:clusterBackup.property.filepath'),
      width: 180,
      dataIndex: 'filePath',
      key: 'filepath',
      hideInSearch: true,
    },
    {
      title: t('columns.actions'),
      width: 80,
      key: 'actions',
      valueType: 'option',
      render(_, record) {
        return [
          <Popconfirm
            key="restore"
            title={t('restore.confirm')}
            icon={<QuestionCircleOutlined />}
            onConfirm={async () => {
              restoreAction(record)
            }}
          >
            <a>{t('actions.restore')}</a>
          </Popconfirm>,
          <DeleteConfirm
            key="delete"
            title={t('delete.confirm')}
            confirmInput={{
              expect: 'delete',
            }}
            onConfirm={async (close) => {
              await deleteAction(record.id!)
              close()
            }}
          >
            <a className="danger-link">{t('actions.delete')}</a>
          </DeleteConfirm>,
        ]
      },
    },
  ]
}
