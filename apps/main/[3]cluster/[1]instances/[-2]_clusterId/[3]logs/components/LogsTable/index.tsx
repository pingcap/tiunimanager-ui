import HeavyTable from '@/components/HeavyTable'
import { useMemo, useState } from 'react'
import { ColumnsState, ProColumns } from '@ant-design/pro-table'
import { ClusterInfo, ClusterLogItem, PagedResult } from '@/api/model'
import {
  useQueryClusterLogs,
  QueryClusterLogsParams,
} from '@/api/hooks/cluster'
import { loadI18n, useI18n } from '@i18n-macro'
import { TFunction } from 'react-i18next'
import { usePagination } from '@hooks/usePagination'
import styles from './index.module.less'
import { getTimestamp } from '@/utils/time'

loadI18n()

export interface LogsTableProps {
  cluster: ClusterInfo
}

export function LogsTable({ cluster }: LogsTableProps) {
  const { data, refetch, isLoading, setPagination, pagination, setFilter } =
    useFetchLogsData(cluster.clusterId!)

  const columns = useTableColumns()

  return (
    <HeavyTable
      className={styles.logsTable}
      headerTitle={null}
      loading={isLoading}
      onSubmit={(filters) => {
        const { startTime, endTime, ...rest } = filters as {
          startTime?: string
          endTime?: string
        }
        setFilter({
          startTime: startTime ? getTimestamp(startTime) : undefined,
          endTime: endTime ? getTimestamp(endTime) : undefined,
          ...rest,
        })
      }}
      dataSource={data?.data.data?.results || []}
      search={{
        filterType: 'light',
      }}
      options={{
        reload: () => refetch(),
      }}
      columns={columns}
      columnsState={{
        persistenceKey: 'log-table-show',
        defaultValue: defaultColumnsSetting,
      }}
      pagination={{
        pageSize: pagination.pageSize,
        current: pagination.page,
        total: (data?.data as PagedResult)?.page?.total || 0,
        onChange(page, pageSize) {
          setPagination({ page, pageSize: pageSize || pagination.pageSize })
        },
      }}
      rowKey="id"
    />
  )
}

function useTableColumns() {
  const { t, i18n } = useI18n()

  return useMemo(() => getColumns(t), [i18n.language])
}

function getColumns(t: TFunction<''>) {
  const columns: ProColumns<ClusterLogItem>[] = [
    {
      title: t('filter.startTime'),
      width: 120,
      key: 'startTime',
      valueType: 'dateTime',
      hideInTable: true,
    },
    {
      title: t('filter.endTime'),
      width: 120,
      key: 'endTime',
      valueType: 'dateTime',
      hideInTable: true,
    },
    {
      title: t('model:clusterLog.property.time'),
      width: 180,
      key: 'time',
      dataIndex: 'timestamp',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: t('model:clusterLog.property.component'),
      width: 120,
      key: 'module',
      dataIndex: 'module',
      valueType: 'select',
      valueEnum: {
        tidb: { text: 'TiDB' },
        tikv: { text: 'TiKV' },
        pd: { text: 'PD' },
        tiflash: { text: 'TiFlash' },
        ticdc: { text: 'TiCDC' },
      },
    },
    {
      title: t('model:clusterLog.property.level'),
      width: 80,
      key: 'level',
      dataIndex: 'level',
      valueType: 'select',
      valueEnum: {
        DEBUG: { text: 'DEBUG' },
        INFO: { text: 'INFO' },
        WARN: { text: 'WARN' },
        ERROR: { text: 'ERROR' },
        FATAL: { text: 'FATAL' },
      },
    },
    {
      title: t('model:clusterLog.property.message'),
      key: 'message',
      dataIndex: 'message',
      ellipsis: true,
    },
    {
      title: t('model:clusterLog.property.ip'),
      width: 140,
      dataIndex: 'ip',
      key: 'ip',
    },
    {
      title: t('model:clusterLog.property.source'),
      width: 160,
      key: 'source',
      dataIndex: 'sourceLine',
      hideInSearch: true,
    },
  ]
  return columns
}

function useFetchLogsData(clusterId: string) {
  const [pagination, setPagination] = usePagination(20)
  const [filters, setFilter] = useState<
    Omit<QueryClusterLogsParams, 'clusterId' | 'from' | 'size'>
  >({})
  const { data, isLoading, refetch } = useQueryClusterLogs(
    {
      clusterId,
      ...filters,
      ...pagination,
    },
    { refetchOnWindowFocus: false }
  )
  return {
    pagination,
    setPagination,
    data,
    setFilter,
    isLoading,
    refetch,
  }
}

const defaultColumnsSetting: Record<string, ColumnsState> = {}
