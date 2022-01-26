import { useCallback, useMemo, useState } from 'react'
import { useQueryClient } from 'react-query'
import { TFunction } from 'react-i18next'
import { loadI18n, useI18n } from '@i18n-macro'
import { Tag } from 'antd'
import { ColumnsState, ProColumns } from '@ant-design/pro-table'
import HeavyTable from '@/components/HeavyTable'
import { HostInfo, PagedResult } from '@/api/model'
import {
  invalidateHostDetail,
  invalidateHostsList,
  useDeleteHosts,
  useQueryHostsList,
} from '@/api/hooks/resources'
import { usePagination } from '@hooks/usePagination'
import { DeleteConfirm } from '@/components/DeleteConfirm'
import { NameAndID } from '@/components/NameAndID'
import { isNumber } from '@/utils/types'

import styles from './index.module.less'

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
          payload: { hostsId: hostId },
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
      title: `${t('model:host.property.id')} / ${t(
        'model:host.property.hostName'
      )}`,
      width: 220,
      key: 'id+name',
      hideInSearch: true,
      fixed: 'left',
      render: (_, record) => (
        <NameAndID name={record.hostName} id={record.hostId!} />
      ),
    },
    {
      title: t('model:host.property.ip'),
      width: 120,
      dataIndex: 'ip',
      key: 'ip',
      hideInSearch: true,
    },
    {
      title: t('model:host.property.status'),
      width: 120,
      dataIndex: 'status',
      key: 'status',
      valueType: 'select',
      valueEnum: {
        Init: { text: t('model:host.status.init'), status: 'Processing' },
        Online: { text: t('model:host.status.online'), status: 'Success' },
        Offline: { text: t('model:host.status.offline'), status: 'Default' },
        Failed: { text: t('model:host.status.failed'), status: 'Error' },
        Deleting: { text: t('model:host.status.failed'), status: 'Error' },
        Deleted: { text: t('model:host.status.deleted'), status: 'Error' },
      },
    },
    {
      // only for filter
      title: t('model:host.property.purpose'),
      width: 140,
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
      width: 140,
      key: 'purpose-show',
      render: (_, record) =>
        record.purpose
          ?.split(',')
          .map((p) => t(`model:host.purpose.${p.toLowerCase()}`))
          .join(' / '),
      hideInSearch: true,
    },
    {
      title: t('columns.cpu'),
      width: 140,
      key: 'cpu',
      tooltip: `${t('capacity.allocated')} / ${t('capacity.total')}`,
      render: (_, record) => `${record.usedMemory ?? 0} / ${record.cpuCores}`,
      hideInSearch: true,
    },
    {
      title: t('columns.memory'),
      width: 140,
      key: 'memory',
      tooltip: `${t('capacity.allocated')} / ${t('capacity.total')}`,
      render: (_, record) => `${record.usedMemory ?? 0} / ${record.memory}`,
      hideInSearch: true,
    },
    {
      title: t('model:host.property.diskType'),
      width: 100,
      dataIndex: 'diskType',
      key: 'diskType',
      render: (_, record) =>
        t(`model:host.disk.type.${record.diskType?.toLocaleLowerCase()}`, '-'),
      hideInSearch: true,
    },
    {
      title: t('columns.storage'),
      width: 240,
      dataIndex: 'disks',
      key: 'storage',
      tooltip: `${t('model:host.disk.property.name')}, ${t(
        'model:host.disk.property.path'
      )}, ${t('model:host.disk.property.capacity')}, ${t(
        'model:host.disk.property.status'
      )}`,
      render: (_, record) =>
        record.disks?.map((item) => (
          <div key={item.diskId}>
            {item.name}, {item.path}, {item.capacity}GiB,{' '}
            {t(`model:host.disk.status.${item.status}`)}
          </div>
        )),
      hideInSearch: true,
    },
    {
      title: t('columns.location'),
      width: 250,
      key: 'location',
      tooltip: `${t('model:host.property.vendor')}, ${t(
        'model:host.property.region'
      )}, ${t('model:host.property.zone')}, ${t('model:host.property.rack')}`,
      render: (_, record) =>
        [record.vendor, record.region, record.az, record.rack]
          .filter((el) => el)
          .join(', '),
      hideInSearch: true,
    },
    {
      title: t('model:host.property.labels'),
      width: 200,
      key: 'labels',
      dataIndex: 'syslabels',
      render: (_, record) =>
        record.sysLabels?.map((label, idx) => <Tag key={idx}>{label}</Tag>),
      hideInSearch: true,
    },
    {
      title: t('model:host.property.os'),
      width: 120,
      key: 'os',
      dataIndex: 'os',
      hideInSearch: true,
    },
    {
      title: t('model:host.property.arch'),
      width: 100,
      dataIndex: 'arch',
      key: 'arch',
      hideInSearch: true,
    },
    {
      title: t('model:host.property.nic'),
      width: 100,
      dataIndex: 'nic',
      key: 'nic',
      hideInSearch: true,
    },
    {
      title: t('model:host.property.createTime'),
      width: 150,
      dataIndex: 'createTime',
      key: 'createTime',
      valueType: 'dateTime',
      renderText: (_, record) =>
        isNumber(record.createTime) ? record.createTime * 1000 : null,
      hideInSearch: true,
    },
    {
      title: t('model:host.property.updateTime'),
      width: 150,
      dataIndex: 'updateTime',
      key: 'updateTime',
      valueType: 'dateTime',
      renderText: (_, record) =>
        isNumber(record.updateTime) ? record.updateTime * 1000 : null,
      hideInSearch: true,
    },
    {
      title: t('columns.actions'),
      width: 80,
      key: 'actions',
      fixed: 'right',
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
            title={t('delete.name')}
            content={t('delete.confirm', { hostName: record.hostName })}
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
  id: { show: false },
  labels: { show: false },
  os: { show: false },
  arch: { show: false },
  nic: { show: false },
  createTime: { show: false },
  updateTime: { show: false },
}
