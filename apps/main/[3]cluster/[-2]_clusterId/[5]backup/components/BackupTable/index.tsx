import { ColumnsState, ProColumns } from '@ant-design/pro-table'
import { useCallback, useMemo, useState } from 'react'
import useLocalStorage from '@hooks/useLocalstorage'
import {
  ClusterapiClusterDisplayInfo,
  ControllerResultWithPage,
  InstanceapiBackupRecord,
} from '#/api'
import HeavyTable from '@/components/HeavyTable'
import { message, Popconfirm } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'
import {
  invalidateClusterBackups,
  useDeleteClusterBackup,
  useQueryClusterBackups,
} from '@/api/cluster'
import { loadI18n, useI18n } from '@i18n-macro'
import { useQueryClient } from 'react-query'
import styles from './index.module.less'
import { errToMsg } from '@/utils/error'
import { TFunction } from 'react-i18next'
import { getTimestamp } from '@/utils/time'
import { usePagination } from '@hooks/usePagination'
import { DeleteConfirm } from '@/components/DeleteConfirm'
import { useHistoryWithState } from '@/router/helper'
import { resolveRoute } from '@pages-macro'

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
  cluster: ClusterapiClusterDisplayInfo
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

  const { columns, columnsSetting, setColumnSetting } = useTableColumn()

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
        total: (data?.data as ControllerResultWithPage)?.page?.total || 0,
        onChange(page, pageSize) {
          if (!isPreviousData)
            setPagination({ page, pageSize: pageSize || pagination.pageSize })
        },
      }}
      columnsState={columnsSetting}
      onColumnsStateChange={(m) => setColumnSetting(m)}
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

function useTableColumn() {
  const { t, i18n } = useI18n()
  const [columnsSetting, setColumnSetting] = useLocalStorage(
    'cluster-backup-table-show',
    defaultColumnsSetting
  )
  const history = useHistoryWithState()

  const deleteBackup = useDeleteClusterBackup()
  const queryClient = useQueryClient()
  const deleteAction = useCallback(
    (clusterId, backupId) =>
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
    [queryClient, deleteBackup.mutateAsync]
  )

  const restoreAction = useCallback(
    (clusterId: string, backupId: number) => {
      history.push({
        pathname: `${resolveRoute('../../new')}`,
        search: `?clusterId=${clusterId}&backupId=${backupId}`,
        state: { from: resolveRoute('.', clusterId) },
      })
    },
    [history]
  )

  const columns = useMemo(
    () => getColumns(t, restoreAction, deleteAction),
    [i18n.language, deleteAction]
  )

  return {
    columns,
    columnsSetting: {
      value: columnsSetting,
    },
    setColumnSetting,
  }
}

function getColumns(
  t: TFunction<''>,
  restoreAction: (clusterId: string, backupId: number) => any,
  deleteAction: (clusterId: string, backupId: number) => any
): ProColumns<InstanceapiBackupRecord>[] {
  return [
    {
      title: 'ID',
      width: 120,
      dataIndex: 'id',
      key: 'id',
      hideInSearch: true,
    },
    {
      title: t('fields.startTime'),
      width: 120,
      dataIndex: 'startTime',
      key: 'startTime',
      valueType: 'dateTime',
    },
    {
      title: t('fields.endTime'),
      width: 120,
      dataIndex: 'endTime',
      key: 'endTime',
      valueType: 'dateTime',
    },
    {
      title: t('fields.type'),
      width: 60,
      key: 'type',
      hideInSearch: true,
      render: (_, record) => t(`enum.type.${record.backupType!}`),
    },
    {
      title: t('fields.method'),
      width: 60,
      key: 'method',
      hideInSearch: true,
      render: (_, record) => t(`enum.method.${record.backupMethod!}`),
    },
    {
      title: t('fields.mode'),
      width: 60,
      key: 'mode',
      hideInSearch: true,
      render: (_, record) => t(`enum.mode.${record.backupMode}`),
    },
    {
      title: t('fields.operator'),
      width: 80,
      dataIndex: ['operator', 'operatorName'],
      key: 'operator',
      hideInSearch: true,
    },
    {
      title: t('fields.size'),
      width: 100,
      key: 'size',
      hideInSearch: true,
      render: (_, record) => (record.size === 0 ? '-' : `${record.size} MB`),
    },
    {
      title: t('fields.status'),
      width: 80,
      dataIndex: ['status', 'statusName'],
      key: 'status',
      hideInSearch: true,
    },
    {
      title: t('fields.filepath'),
      width: 180,
      dataIndex: 'filePath',
      key: 'filepath',
      hideInSearch: true,
    },
    {
      title: t('fields.actions'),
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
              restoreAction(record.clusterId!, record.id!)
            }}
          >
            <a>{t('actions.restore')}</a>
          </Popconfirm>,
          <DeleteConfirm
            key="delete"
            title={t('delete.confirm')}
            confirmInput={{
              tip: '',
              expect: 'delete',
            }}
            onConfirm={async (close) => {
              await deleteAction(record.clusterId!, record.id!)
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
