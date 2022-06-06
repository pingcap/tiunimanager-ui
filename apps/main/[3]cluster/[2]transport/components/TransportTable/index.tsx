/*
 * Copyright 2022 PingCAP, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ColumnsState, ProColumns } from '@ant-design/pro-table'
import { useCallback, useMemo, useState } from 'react'
import { PagedResult, TransportRecord, TransportStatus } from '@/api/model'
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
import { Tooltip } from 'antd'
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
        {
          payload: {
            recordId,
            clusterId,
          },
          options: {
            successMessage: t('delete.success'),
            errorMessage: t('delete.failed'),
          },
        },
        {
          onSettled() {
            return Promise.allSettled([invalidateTransportRecords(queryClient)])
          },
        }
      ),
    [queryClient, deleteTransportRecord.mutateAsync]
  )

  return useMemo(() => getColumns(t, deleteAction), [i18n.language])
}

const defaultColumnsSetting: Record<string, ColumnsState> = {}

function getColumns(
  t: TFunction<''>,
  deleteAction: (recordId: string, clusterId: string) => unknown
): ProColumns<TransportRecord>[] {
  return [
    {
      title: t('model:transport.property.id'),
      width: 200,
      dataIndex: 'recordId',
      fixed: 'left',
      key: 'id',
      hideInSearch: true,
    },
    {
      title: t('model:transport.property.type'),
      width: 80,
      dataIndex: 'transportType',
      key: 'type',
      hideInSearch: true,
      renderText: (_, record) =>
        t(`model:transport.type.${record.transportType}`),
    },
    {
      title: t('model:transport.property.status'),
      width: 80,
      dataIndex: 'status',
      key: 'status',
      valueType: 'select',
      valueEnum: {
        Initializing: {
          text: t('model:transport.status.initializing'),
          status: 'Default',
        },
        Processing: {
          text: t('model:transport.status.processing'),
          status: 'Processing',
        },
        Finished: {
          text: t('model:transport.status.success'),
          status: 'Success',
        },
        Failed: {
          text: t('model:transport.status.failed'),
          status: 'Error',
        },
      },
      hideInSearch: true,
    },
    {
      title: t('model:transport.property.clusterId'),
      width: 200,
      dataIndex: 'clusterId',
      key: 'clusterId',
      render: (_, record) => (
        <Link to={`${resolveRoute('../instances/')}/${record.clusterId}`}>
          {record.clusterId}
        </Link>
      ),
    },
    {
      title: t('model:transport.property.startTime'),
      width: 150,
      dataIndex: 'startTime',
      key: 'startTime',
      valueType: 'dateTime',
    },
    {
      title: t('model:transport.property.endTime'),
      width: 150,
      dataIndex: 'endTime',
      key: 'endTime',
      valueType: 'dateTime',
    },
    {
      title: t('model:transport.property.filePath'),
      width: 220,
      key: 'filePath',
      hideInSearch: true,
      render: (_, record) => (
        <span>
          <CopyIconButton
            text={`${record.filePath}/${record.zipName}`}
            label={t('copy.filePath')}
          />
          {record.filePath}/{record.zipName}
        </span>
      ),
    },
    {
      title: t('model:transport.property.comment'),
      width: 220,
      dataIndex: 'comment',
      key: 'comment',
      hideInSearch: true,
    },
    {
      title: t('columns.actions'),
      valueType: 'option',
      fixed: 'right',
      width: 160,
      render: (_, record) => {
        const isError =
          record.status === undefined ||
          record.status === TransportStatus.failed
        return [
          record.storageType !== 'nfs' ||
          record.transportType !== 'export' ||
          isError ? (
            <Tooltip title={t('download.notSupport')} key="download">
              <span className="disabled-text-btn">{t('actions.download')}</span>
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
