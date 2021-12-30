import { ColumnsState, ProColumns } from '@ant-design/pro-table'
import HeavyTable from '@/components/HeavyTable'
import { HostInfo, PagedResult } from '@/api/model'
import { useCallback, useMemo, useState } from 'react'
import {
  invalidateHostDetail,
  invalidateHostsList,
  useDeleteHosts,
  useQueryHostsList,
} from '@/api/hooks/resources'
import { useQueryClient } from 'react-query'
import styles from './index.module.less'
import { loadI18n, useI18n } from '@i18n-macro'
import { TFunction } from 'react-i18next'
import { usePagination } from '@hooks/usePagination'
import { DeleteConfirm } from '@/components/DeleteConfirm'
import { isNumber } from '@/utils/types'

loadI18n()

export default function HostTable() {
  const {
    data,
    refetch,
    isLoading,
    isPreviousData,
    setFilter,
    setPagination,
    pagination,
  } = useFetchHostData()
  const columns = useTableColumn()

  return (
    <HeavyTable
      headerTitle={null}
      loading={isLoading}
      dataSource={data?.data.data?.hosts || []}
      onSubmit={(filters) => {
        setFilter(filters as any)
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
      rowKey="hostId"
      columnsState={{
        persistenceKey: 'host-table-show',
        defaultValue: defaultColumnsSetting,
      }}
      search={{
        filterType: 'light',
      }}
      className={styles.hostTable}
      options={{
        reload: () => refetch(),
      }}
    />
  )
}

function useFetchHostData() {
  const [pagination, setPagination] = usePagination()
  const [filters, setFilter] = useState({})
  const { data, isLoading, isPreviousData, refetch } = useQueryHostsList(
    {
      ...pagination,
      ...filters,
    },
    { keepPreviousData: true }
  )
  return {
    pagination,
    setPagination,
    setFilter,
    data,
    isPreviousData,
    isLoading,
    refetch,
  }
}

function useTableColumn() {
  const { t, i18n } = useI18n()
  const deleteHosts = useDeleteHosts()
  const queryClient = useQueryClient()
  const deleteAction = useCallback(
    (hostId) =>
      deleteHosts.mutateAsync(
        {
          hostsId: hostId,
          options: {
            actionName: t('delete.name'),
          },
        },
        {
          onSettled() {
            return Promise.allSettled([
              invalidateHostsList(queryClient),
              invalidateHostDetail(queryClient, hostId),
            ])
          },
        }
      ),
    [queryClient, deleteHosts.mutateAsync]
  )

  return useMemo(
    () => getHostColumns(t, deleteAction),
    [deleteAction, i18n.language]
  )
}

function getHostColumns(
  t: TFunction<''>,
  deleteAction: (hostId: string) => void
): ProColumns<HostInfo>[] {
  return [
    {
      title: t('model:host.property.id'),
      width: 140,
      dataIndex: 'hostId',
      key: 'id',
      hideInSearch: true,
    },
    {
      title: t('model:host.property.hostName'),
      width: 120,
      dataIndex: 'hostName',
      key: 'hostName',
      hideInSearch: true,
    },
    {
      title: t('model:host.property.ip'),
      width: 140,
      dataIndex: 'ip',
      key: 'ip',
      hideInSearch: true,
    },
    {
      title: t('model:host.property.status'),
      width: 80,
      dataIndex: 'status',
      key: 'status',
      valueType: 'select',
      valueEnum: {
        Online: { text: t('model:host.status.online'), status: 'Success' },
        Offline: { text: t('model:host.status.offline'), status: 'Default' },
        Deleted: { text: t('model:host.status.deleted'), status: 'Error' },
      },
    },
    {
      title: t('model:host.property.load'),
      width: 160,
      dataIndex: 'loadStat',
      key: 'loadStat',
      valueType: 'select',
      valueEnum: {
        LoadLess: { text: t('model:host.load.idle'), status: 'Default' },
        InUsed: { text: t('model:host.load.used'), status: 'Processing' },
        Exhaust: { text: t('model:host.load.full'), status: 'Warning' },
        ComputeExhaust: {
          text: t('model:host.load.computeExhausted'),
          status: 'Warning',
        },
        DiskExhaust: {
          text: t('model:host.load.storageExhausted'),
          status: 'Warning',
        },
        Exclusive: {
          text: t('model:host.load.exclusive'),
          status: 'Processing',
        },
      },
    },
    {
      title: t('columns.location'),
      width: 200,
      key: 'location',
      tooltip: `${t('model:host.property.region')}, ${t(
        'model:host.property.az'
      )}, ${t('model:host.property.rack')}`,
      hideInSearch: true,
      render(_, record) {
        return `${record.region}, ${record.az}, ${record.rack}`
      },
    },
    {
      title: t('model:host.property.nic'),
      width: 120,
      dataIndex: 'nic',
      key: 'nic',
      hideInSearch: true,
    },
    {
      // only for filter
      title: t('model:host.property.purpose'),
      width: 80,
      dataIndex: 'purpose',
      key: 'purpose',
      valueType: 'select',
      valueEnum: {
        Compute: { text: t('model:host.purpose.compute') },
        Storage: { text: t('model:host.purpose.storage') },
        Schedule: { text: t('model:host.purpose.schedule') },
      },
      hideInTable: true,
    },
    {
      // only for table
      title: t('model:host.property.purpose'),
      width: 80,
      dataIndex: 'purpose',
      key: 'purpose-show',
      render: (_, record) => record,
    },
    {
      title: t('columns.system'),
      width: 140,
      key: 'system',
      render(_, record) {
        return `${record.os} ${record.kernel}`
      },
      hideInSearch: true,
    },
    {
      title: t('columns.availableSpec'),
      width: 130,
      key: 'availableSpec',
      render(_, record) {
        return `${record.freeCpuCores}C ${record.freeMemory}G`
      },
      hideInSearch: true,
    },
    {
      title: t('columns.spec'),
      width: 130,
      dataIndex: 'spec',
      key: 'spec',
      hideInSearch: true,
    },
    {
      title: t('model:host.property.createTime'),
      width: 180,
      dataIndex: 'createTime',
      key: 'createTime',
      hideInSearch: true,
      valueType: 'dateTime',
      renderText: (_, record) =>
        isNumber(record.createTime) ? record.createTime * 1000 : null,
    },
    {
      title: t('model:host.property.updateTime'),
      width: 180,
      dataIndex: 'updateTime',
      key: 'updateTime',
      hideInSearch: true,
      valueType: 'dateTime',
      renderText: (_, record) =>
        isNumber(record.updateTime) ? record.updateTime * 1000 : null,
    },
    {
      title: t('columns.actions'),
      width: 120,
      key: 'actions',
      valueType: 'option',
      render(_, record) {
        return [
          // TODO: wait for edit support and monitor support
          // <a key="edit">
          //   {record.status === 1 ? t('actions.offline') : t('actions.online')}
          // </a>,
          // <a key="monitor">{t('actions.monitor')}</a>,
          <DeleteConfirm
            key="delete"
            title={t('delete.confirm')}
            confirmInput={{
              expect: 'delete',
            }}
            onConfirm={async (close) => {
              await deleteAction(record.hostId!)
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

const defaultColumnsSetting: Record<string, ColumnsState> = {
  operator: { show: false },
  actions: { fixed: 'right' },
  id: { show: false },
  nic: { show: false },
  system: { show: false },
}
