import { ColumnsState, ProColumns } from '@ant-design/pro-table'
import { useCallback, useMemo, useState } from 'react'
import { PagedResult, TransportRecord } from '@/api/model'
import HeavyTable from '@/components/HeavyTable'
import styles from './index.module.less'
import { TFunction } from 'react-i18next'
import { usePagination } from '@hooks/usePagination'
import { loadI18n, useI18n } from '@i18n-macro'
import { DeleteConfirm } from '@/components/DeleteConfirm'
import {
  invalidateTransportRecords,
  useDeleteTransportRecord,
  useQueryTransportRecords,
} from '@/api/hooks/transport'
import { useQueryClient } from 'react-query'
import { message, Tooltip } from 'antd'
import { errToMsg } from '@/utils/error'
import moment from 'moment'
import { CopyIconButton } from '@/components/CopyToClipboard'
import { useDownload } from '@hooks/useDownload'
import { getFsDownloadURL } from '@/api/hooks/fs'
import { Link } from 'react-router-dom'
import { resolveRoute } from '@pages-macro'

loadI18n()

export default function TransportTable() {
  const {
    data,
    isLoading,
    isPreviousData,
    setPagination,
    pagination,
    setFilter,
    refetch,
  } = useFetchTransportData()

  const columns = useTableColumn()

  return (
    <HeavyTable
      loading={isLoading}
      dataSource={data?.data.data?.transportRecords || []}
      className={styles.transportTable}
      headerTitle={null}
      onSubmit={(filters: any) => {
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
      rowKey="recordId"
      search={{
        filterType: 'light',
      }}
      columnsState={{
        persistenceKey: 'transport-table-show',
        defaultValue: defaultColumnsSetting,
      }}
      options={{
        reload: () => refetch(),
      }}
    />
  )
}

function useFetchTransportData() {
  const [pagination, setPagination] = usePagination()
  const [filters, setFilter] = useState<{
    clusterId?: string
    startTime?: string
    endTime?: string
  }>({
    clusterId: undefined,
    startTime: undefined,
    endTime: undefined,
  })
  const { data, isLoading, isPreviousData, refetch } = useQueryTransportRecords(
    {
      ...pagination,
      clusterId: filters.clusterId,
      startTime: filters.startTime
        ? moment(filters.startTime).unix()
        : undefined,
      endTime: filters.endTime ? moment(filters.endTime).unix() : undefined,
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
  const deleteTransportRecord = useDeleteTransportRecord()
  const queryClient = useQueryClient()
  const deleteAction = useCallback(
    (recordId, clusterId) =>
      deleteTransportRecord.mutateAsync(
        { recordId, clusterId },
        {
          onSuccess(data) {
            message.success(t('delete.success', { msg: data.data.data })).then()
          },
          onSettled() {
            return Promise.allSettled([invalidateTransportRecords(queryClient)])
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
    [queryClient, deleteTransportRecord.mutateAsync]
  )

  return useMemo(() => getColumns(t, deleteAction), [i18n.language])
}

const defaultColumnsSetting: Record<string, ColumnsState> = {
  actions: { fixed: 'right' },
}

function getColumns(
  t: TFunction<''>,
  deleteAction: (recordId: number, clusterId: string) => unknown
): ProColumns<TransportRecord>[] {
  return [
    {
      title: t('model:transport.property.id'),
      width: 80,
      dataIndex: 'recordId',
      key: 'id',
      hideInSearch: true,
    },
    {
      title: t('model:transport.property.startTime'),
      width: 160,
      dataIndex: 'startTime',
      key: 'startTime',
      valueType: 'dateTime',
    },
    {
      title: t('model:transport.property.endTime'),
      width: 160,
      dataIndex: 'endTime',
      key: 'endTime',
      valueType: 'dateTime',
    },
    {
      title: t('model:transport.property.type'),
      width: 80,
      dataIndex: 'transportType',
      key: 'type',
      // transport.status === task.status
      hideInSearch: true,
      renderText: (_, record) =>
        t(`model:transport.type.${record.transportType}`),
    },
    {
      title: t('model:transport.property.status'),
      width: 80,
      dataIndex: ['status', 'statusCode'],
      key: 'status',
      valueType: 'select',
      // transport.status === task.status
      valueEnum: {
        '0': { text: t('model:task.status.init'), status: 'Default' },
        '1': { text: t('model:task.status.processing'), status: 'Processing' },
        '2': { text: t('model:task.status.finished'), status: 'Success' },
        '3': { text: t('model:task.status.error'), status: 'Error' },
      },
      hideInSearch: true,
    },
    {
      title: t('model:transport.property.clusterId'),
      width: 160,
      dataIndex: 'clusterId',
      key: 'clusterId',
      render: (_, record) => (
        <Link to={`${resolveRoute('../instances/')}/${record.clusterId}`}>
          {record.clusterId}
        </Link>
      ),
    },
    {
      title: t('model:transport.property.fileName'),
      width: 160,
      dataIndex: 'zipName',
      key: 'fileName',
      hideInSearch: true,
    },
    {
      title: t('model:transport.property.filePath'),
      width: 180,
      key: 'filePath',
      hideInSearch: true,
      render: (_, record) => (
        <span>
          <CopyIconButton text={record.filePath!} label={t('copy.filePath')} />
          {record.filePath}
        </span>
      ),
    },
    {
      title: t('model:transport.property.comment'),
      width: 180,
      dataIndex: 'comment',
      key: 'comment',
      hideInSearch: true,
    },
    {
      title: t('columns.actions'),
      valueType: 'option',
      width: 100,
      render: (_, record) => {
        return [
          record.storageType !== 'nfs' || record.transportType !== 'export' ? (
            <Tooltip title={t('download.notSupport')} key="download">
              <span className={styles.disabled}>{t('actions.download')}</span>
            </Tooltip>
          ) : (
            <a
              key="download"
              onClick={() => useDownload(getFsDownloadURL(record.recordId!))}
            >
              {t('actions.download')}
            </a>
          ),
          <DeleteConfirm
            key="delete"
            title={t('delete.confirm')}
            confirmInput={{
              expect: 'delete',
            }}
            onConfirm={async (close) => {
              await deleteAction(record.recordId!, record.clusterId!)
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
