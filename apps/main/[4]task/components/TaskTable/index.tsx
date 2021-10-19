import { ProColumns } from '@ant-design/pro-table'
import { useMemo, useState } from 'react'
import { PagedResult, TaskWorkflowInfo } from '@/api/model'
import HeavyTable from '@/components/HeavyTable'
import { loadI18n, useI18n } from '@i18n-macro'
import styles from './index.module.less'
import { TFunction } from 'react-i18next'
import { usePagination } from '@hooks/usePagination'
import { useQueryTasks } from '@/api/hooks/task'

loadI18n()

export default function TaskTable() {
  const {
    data,
    isLoading,
    isPreviousData,
    setPagination,
    pagination,
    setFilter,
    refetch,
  } = useFetchTaskData()

  const columns = useTableColumn()

  return (
    <HeavyTable
      loading={isLoading}
      dataSource={data?.data.data || []}
      className={styles.taskTable}
      headerTitle={null}
      onSubmit={(filters: any) => {
        if (!filters.status) filters.status = -1
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

function useFetchTaskData() {
  const [pagination, setPagination] = usePagination()
  const [filters, setFilter] = useState<{
    keyword?: string
    clusterId?: string
    status?: number
  }>({
    keyword: undefined,
    clusterId: undefined,
    status: -1,
  })
  const { data, isLoading, isPreviousData, refetch } = useQueryTasks(
    {
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

  return useMemo(() => getColumns(t), [i18n.language])
}

function getColumns(t: TFunction<''>): ProColumns<TaskWorkflowInfo>[] {
  return [
    {
      title: t('fields.id'),
      width: 120,
      dataIndex: 'id',
      key: 'id',
      hideInSearch: true,
    },
    {
      title: t('fields.name'),
      width: 120,
      dataIndex: 'flowWorkName',
      key: 'keyword',
    },
    {
      title: t('fields.status'),
      width: 100,
      dataIndex: 'statusCode',
      key: 'status',
      valueType: 'select',
      valueEnum: {
        '0': { text: t('status.init'), status: 'Default' },
        '1': { text: t('status.processing'), status: 'Processing' },
        '2': { text: t('status.finished'), status: 'Success' },
        '3': { text: t('status.error'), status: 'Error' },
      },
    },
    {
      title: t('fields.clusterId'),
      width: 140,
      dataIndex: 'clusterId',
      key: 'clusterId',
    },
    {
      title: t('fields.startTime'),
      width: 100,
      dataIndex: 'createTime',
      key: 'startTime',
      hideInSearch: true,
      valueType: 'dateTime',
    },
    {
      title: t('fields.endTime'),
      width: 100,
      dataIndex: 'updateTime',
      key: 'endTime',
      hideInSearch: true,
      valueType: 'dateTime',
    },
    {
      title: t('fields.operator'),
      width: 80,
      dataIndex: 'operatorName',
      key: 'operator',
      hideInSearch: true,
    },
  ]
}
