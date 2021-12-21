import { ProColumns } from '@ant-design/pro-table'
import { useMemo, useState } from 'react'
import { PagedResult, TaskWorkflowInfo, TaskWorkflowStatus } from '@/api/model'
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
    totalPage,
    setPagination,
    pagination,
    setFilter,
    refetch,
  } = useFetchTaskData()

  const columns = useTableColumn()

  return (
    <HeavyTable
      loading={isLoading}
      dataSource={data || []}
      className={styles.taskTable}
      headerTitle={null}
      onSubmit={(filters: any) => {
        setFilter(filters as any)
      }}
      tooltip={false}
      columns={columns}
      pagination={{
        pageSize: pagination.pageSize,
        current: pagination.page,
        total: totalPage,
        onChange(page, pageSize) {
          if (!isPreviousData)
            setPagination({ page, pageSize: pageSize || pagination.pageSize })
        },
      }}
      rowKey="id"
      search={{
        filterType: 'light',
      }}
      columnsState={{
        persistenceKey: 'task-table-show',
        defaultValue: {},
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
    bizId?: string
    status?: TaskWorkflowStatus
  }>({
    keyword: undefined,
    bizId: undefined,
    status: undefined,
  })
  const { data, isLoading, isPreviousData, refetch } = useQueryTasks(
    {
      ...pagination,
      ...filters,
    },
    { keepPreviousData: true }
  )

  const result = data?.data

  return {
    pagination,
    setPagination,
    totalPage: (result as PagedResult)?.page?.total || 0,
    data: result?.data?.workFlows,
    isPreviousData,
    setFilter,
    isLoading,
    refetch,
  }
}

function useTableColumn() {
  const { t, i18n } = useTranslation(['model', 'task'])

  return useMemo(() => getColumns(t), [i18n.language])
}

function getColumns(
  t: TFunction<('model' | 'task')[]>
): ProColumns<TaskWorkflowInfo>[] {
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
      dataIndex: 'name',
      key: 'keyword',
      renderText: (text) => t(`task:name.${text}`, text),
    },
    {
      title: t('model:task.property.status'),
      width: 100,
      dataIndex: 'status',
      key: 'status',
      valueType: 'select',
      valueEnum: {
        [TaskWorkflowStatus.Initializing]: {
          text: t('model:task.status.init'),
          status: 'Default',
        },
        [TaskWorkflowStatus.Processing]: {
          text: t('model:task.status.processing'),
          status: 'Processing',
        },
        [TaskWorkflowStatus.Finished]: {
          text: t('model:task.status.finished'),
          status: 'Success',
        },
        [TaskWorkflowStatus.Error]: {
          text: t('model:task.status.error'),
          status: 'Error',
        },
        [TaskWorkflowStatus.Canceled]: {
          text: t('model:task.status.cancelled'),
          status: 'Default',
        },
      },
    },
    {
      title: t('model:task.property.bizId'),
      width: 140,
      dataIndex: 'bizId',
      key: 'bizId',
    },
    {
      title: t('model:task.property.creationTime'),
      width: 100,
      dataIndex: 'createTime',
      key: 'creationTime',
      hideInSearch: true,
      valueType: 'dateTime',
    },
    {
      title: t('model:task.property.updateTime'),
      width: 100,
      dataIndex: 'updateTime',
      key: 'updateTime',
      hideInSearch: true,
      valueType: 'dateTime',
    },
  ]
}
