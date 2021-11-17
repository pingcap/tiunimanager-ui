import { ColumnsState, ProColumns } from '@ant-design/pro-table'
import HeavyTable from '@/components/HeavyTable'
import { PagedResult, HostInfo } from '@/api/model'
import { useCallback, useMemo, useState } from 'react'
import { message } from 'antd'
import useLocalStorage from '@hooks/useLocalstorage'
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
import { errToMsg } from '@/utils/error'
import { usePagination } from '@hooks/usePagination'
import { DeleteConfirm } from '@/components/DeleteConfirm'

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
  const { columns, columnsSetting, setColumnSetting } = useTableColumn()

  return (
    <HeavyTable
      headerTitle={null}
      loading={isLoading}
      dataSource={data?.data.data || []}
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
      columnsState={columnsSetting}
      search={{
        filterType: 'light',
      }}
      onColumnsStateChange={(m) => setColumnSetting(m)}
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
        { hostsId: hostId },
        {
          onSuccess(data) {
            message.success(t('delete.success', { msg: data.data.data })).then()
          },
          onSettled() {
            return Promise.allSettled([
              invalidateHostsList(queryClient),
              invalidateHostDetail(queryClient, hostId),
            ])
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
    [queryClient, deleteHosts.mutateAsync]
  )
  const columns = useMemo(
    () => getHostColumns(t, deleteAction),
    [deleteAction, i18n.language]
  )

  const [columnsSetting, setColumnSetting] = useLocalStorage(
    'host-table-show',
    defaultColumnsSetting
  )
  return {
    columns,
    columnsSetting: {
      value: columnsSetting,
    },
    setColumnSetting,
  }
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
        0: { text: t('model:host.status.online'), status: 'Success' },
        1: { text: t('model:host.status.offline'), status: 'Default' },
      },
    },
    {
      title: t('model:host.property.load'),
      width: 80,
      dataIndex: 'loadStat',
      key: 'loadStat',
      valueType: 'select',
      valueEnum: {
        0: { text: t('model:host.load.idle'), status: 'Default' },
        1: { text: t('model:host.load.used'), status: 'Processing' },
        2: { text: t('model:host.load.full'), status: 'Warning' },
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
      title: t('model:host.property.purpose'),
      width: 80,
      dataIndex: 'purpose',
      key: 'purpose',
      valueType: 'select',
      valueEnum: {
        Compute: { text: t('model:host.purpose.compute') },
        Storage: { text: t('model:host.purpose.storage') },
        General: { text: t('model:host.purpose.general') },
      },
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
      renderText: (text) => {
        return typeof text === 'number' ? text * 1000 : null
      },
    },
    {
      title: t('model:host.property.updateTime'),
      width: 180,
      dataIndex: 'updateTime',
      key: 'updateTime',
      hideInSearch: true,
      valueType: 'dateTime',
      renderText: (text) => {
        return typeof text === 'number' ? text * 1000 : null
      },
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
