import { ProColumns } from '@ant-design/pro-table'
import { useMemo, useState } from 'react'
import { PagedResult, TaskWorkflowInfo } from '@/api/model'
import HeavyTable from '@/components/HeavyTable'
import styles from './index.module.less'
import { TFunction, useTranslation } from 'react-i18next'
import { usePagination } from '@hooks/usePagination'
import { useQueryTasks } from '@/api/hooks/task'

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
  const { t, i18n } = useTranslation('model')

  return useMemo(() => getColumns(t), [i18n.language])
}

function getColumns(t: TFunction<'model'>): ProColumns<TaskWorkflowInfo>[] {
  return [
    {
      title: t('model:task.property.id'),
      width: 120,
      dataIndex: 'id',
      key: 'id',
      hideInSearch: true,
    },
    {
      title: t('model:task.property.name'),
      width: 120,
      dataIndex: 'flowWorkName',
      key: 'keyword',
      renderText: (text) => t([`model:task.name.${text}`, `model:${text}`]),
    },
    {
      title: t('model:task.property.status'),
      width: 100,
      dataIndex: 'statusCode',
      key: 'status',
      valueType: 'select',
      valueEnum: {
        '0': { text: t('model:task.status.init'), status: 'Default' },
        '1': { text: t('model:task.status.processing'), status: 'Processing' },
        '2': { text: t('model:task.status.finished'), status: 'Success' },
        '3': { text: t('model:task.status.error'), status: 'Error' },
        '4': { text: t('model:task.status.cancelled'), status: 'Default' },
      },
    },
    {
      title: t('model:task.property.clusterId'),
      width: 140,
      dataIndex: 'clusterId',
      key: 'clusterId',
    },
    {
      title: t('model:task.property.startTime'),
      width: 100,
      dataIndex: 'createTime',
      key: 'startTime',
      hideInSearch: true,
      valueType: 'dateTime',
    },
    {
      title: t('model:task.property.endTime'),
      width: 100,
      dataIndex: 'updateTime',
      key: 'endTime',
      hideInSearch: true,
      valueType: 'dateTime',
    },
    {
      title: t('model:task.property.operator'),
      width: 80,
      dataIndex: 'operatorName',
      key: 'operator',
      hideInSearch: true,
      renderText: (text, record) => {
        return record.manualOperator ? text : t('model:task.operator.system')
      },
    },
  ]
}
