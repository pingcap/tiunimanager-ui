import { ColumnsState, ProColumns } from '@ant-design/pro-table'
import HeavyTable from '@/components/HeavyTable'
import { ControllerResultWithPage, HostapiHostInfo } from '#/api'
import { useCallback, useMemo, useState } from 'react'
import { message } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'
import useLocalStorage from '@hooks/useLocalstorage'
import {
  invalidateHostDetail,
  invalidateHostsList,
  useDeleteHosts,
  useQueryHostsList,
} from '@/api/resources'
import { useQueryClient } from 'react-query'
import styles from './index.module.less'
import { loadI18n, useI18n } from '@i18n-macro'
import { TFunction } from 'react-i18next'
import IntlPopConfirm from '@/components/IntlPopConfirm'
import { errToMsg } from '@/utils/error'
import { usePagination } from '@hooks/usePagination'

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
        total: (data?.data as ControllerResultWithPage)?.page?.total || 0,
        onChange(page, pageSize) {
          if (!isPreviousData)
            setPagination({ page, pageSize: pageSize || pagination.pageSize })
        },
      }}
      rowKey="hostId"
      columnsStateMap={columnsSetting}
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
  const [filters, setFilter] = useState<{ status?: number }>({
    status: undefined,
  })
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
  return { columns, columnsSetting, setColumnSetting }
}

function getHostColumns(
  t: TFunction<''>,
  deleteAction: (hostId: string) => void
): ProColumns<HostapiHostInfo>[] {
  return [
    {
      title: t('columns.id'),
      width: 140,
      dataIndex: 'hostId',
      key: 'id',
      hideInSearch: true,
    },
    {
      title: t('columns.hostName'),
      width: 120,
      dataIndex: 'hostName',
      key: 'hostName',
      hideInSearch: true,
    },
    {
      title: t('columns.ip'),
      width: 140,
      dataIndex: 'ip',
      key: 'ip',
      hideInSearch: true,
    },
    {
      title: t('columns.status'),
      width: 80,
      dataIndex: 'status',
      key: 'status',
      valueType: 'select',
      valueEnum: {
        0: { text: t('status.idle'), status: 'Success' },
        1: { text: t('status.offline'), status: 'Default' },
        2: { text: t('status.using'), status: 'Processing' },
        3: { text: t('status.full'), status: 'Warning' },
        4: { text: t('status.deleted'), status: 'Error' },
      },
    },
    {
      title: t('columns.location'),
      width: 200,
      key: 'location',
      tooltip: t('tips.location'),
      hideInSearch: true,
      render(_, record) {
        return `${record.az}, ${record.region}, ${record.rack}`
      },
    },
    {
      title: t('columns.nic'),
      width: 120,
      dataIndex: 'nic',
      key: 'nic',
      hideInSearch: true,
    },
    {
      title: t('columns.purpose'),
      width: 80,
      dataIndex: 'purpose',
      key: 'purpose',
      hideInSearch: true,
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
        return `${record.cpuCores} Core ${record.memory} GB`
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
      title: t('columns.actions'),
      width: 120,
      key: 'actions',
      valueType: 'option',
      render(_, record) {
        return [
          <a key="edit">
            {record.status === 1 ? t('actions.offline') : t('actions.online')}
          </a>,
          <a key="monitor">{t('actions.monitor')}</a>,
          <IntlPopConfirm
            key="delete"
            title={t('delete.confirm')}
            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
            onConfirm={async () => {
              await deleteAction(record.hostId!)
            }}
          >
            <a className="danger-link">{t('actions.delete')}</a>
          </IntlPopConfirm>,
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
