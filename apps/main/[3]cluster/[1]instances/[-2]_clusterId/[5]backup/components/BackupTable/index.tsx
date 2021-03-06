/*
 * Copyright 2022 PingCAP
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

import { useCallback, useMemo, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useQueryClient } from 'react-query'
import { TFunction } from 'react-i18next'
import { loadI18n, useI18n } from '@i18n-macro'
import { resolveRoute } from '@pages-macro'
import { ColumnsState, ProColumns } from '@ant-design/pro-table'
import { QuestionCircleOutlined } from '@ant-design/icons'
import HeavyTable from '@/components/HeavyTable'
import IntlPopConfirm from '@/components/IntlPopConfirm'
import {
  BackupStatus,
  ClusterBackupItem,
  ClusterInfo,
  PagedResult,
} from '@/api/model'
import {
  invalidateClusterBackups,
  useCancelClusterBackup,
  useDeleteClusterBackup,
  useQueryClusterBackups,
} from '@/api/hooks/cluster'
import { getTimestamp } from '@/utils/time'
import { usePagination } from '@hooks/usePagination'
import { DeleteConfirm } from '@/components/DeleteConfirm'

import styles from './index.module.less'

loadI18n()

const defaultColumnsSetting: Record<string, ColumnsState> = {}

export interface BackupTableProps {
  cluster: ClusterInfo
}

export default function BackupTable({ cluster }: BackupTableProps) {
  const {
    data,
    refetch,
    isLoading,
    isPreviousData,
    setPagination,
    pagination,
    setFilter,
  } = useFetchBackupData(cluster.clusterId!)

  const columns = useTableColumn({
    cluster,
  })

  return (
    <HeavyTable
      loading={isLoading}
      dataSource={data?.data.data?.backupRecords || []}
      className={styles.backupTable}
      headerTitle={null}
      onSubmit={(filters) => {
        const { startTime, endTime } = filters as {
          startTime?: string
          endTime?: string
        }
        setFilter({
          startTime: startTime ? getTimestamp(startTime) : undefined,
          endTime: endTime ? getTimestamp(endTime) : undefined,
        })
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
      columnsState={{
        persistenceKey: 'backup-table-show',
        defaultValue: defaultColumnsSetting,
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

function useFetchBackupData(clusterId: string) {
  const [pagination, setPagination] = usePagination()
  const [filters, setFilter] = useState<{
    startTime?: number
    endTime?: number
  }>({
    startTime: undefined,
    endTime: undefined,
  })
  const { data, isLoading, isPreviousData, refetch } = useQueryClusterBackups(
    {
      clusterId,
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

function useTableColumn({ cluster }: { cluster: ClusterInfo }) {
  const clusterId = cluster.clusterId!
  const { t, i18n } = useI18n()
  const history = useHistory()
  const queryClient = useQueryClient()

  const deleteBackup = useDeleteClusterBackup()
  const deleteAction = useCallback(
    (backupId) =>
      deleteBackup.mutateAsync(
        {
          payload: {
            backupId,
            clusterId,
          },
          options: {
            successMessage: t('delete.message.success'),
            errorMessage: t('delete.message.failed'),
          },
        },
        {
          onSettled() {
            return invalidateClusterBackups(queryClient, clusterId)
          },
        }
      ),
    [queryClient, deleteBackup.mutateAsync, clusterId]
  )

  const cancelBackup = useCancelClusterBackup()
  const cancelAction = useCallback(
    (backupId) =>
      cancelBackup.mutateAsync(
        {
          payload: {
            backupId,
            clusterId,
          },
          options: {
            successMessage: t('cancel.message.success'),
            errorMessage: t('cancel.message.failed'),
          },
        },
        {
          onSettled() {
            return invalidateClusterBackups(queryClient, clusterId)
          },
        }
      ),
    [queryClient, cancelBackup.mutateAsync, clusterId]
  )

  const restoreAction = useCallback(
    (backup: ClusterBackupItem) => {
      history.push({
        pathname: resolveRoute('../../restore'),
        state: { backup, cluster },
      })
    },
    [history, cluster]
  )

  return useMemo(
    () => getColumns(t, restoreAction, deleteAction, cancelAction),
    [i18n.language, deleteAction, cancelAction, restoreAction]
  )
}

function getColumns(
  t: TFunction<''>,
  restoreAction: (backup: ClusterBackupItem) => any,
  deleteAction: (backupId: string) => any,
  cancelAction: (backupId: string) => any
): ProColumns<ClusterBackupItem>[] {
  return [
    {
      title: 'ID',
      width: 200,
      dataIndex: 'id',
      key: 'id',
      hideInSearch: true,
      fixed: 'left',
    },
    {
      title: t('model:clusterBackup.property.type'),
      width: 100,
      key: 'type',
      hideInSearch: true,
      render: (_, record) =>
        t(`model:clusterBackup.type.${record.backupType!}`),
    },
    {
      title: t('model:clusterBackup.property.method'),
      width: 100,
      key: 'method',
      hideInSearch: true,
      render: (_, record) =>
        t(`model:clusterBackup.method.${record.backupMethod!}`),
    },
    {
      title: t('model:clusterBackup.property.mode'),
      width: 100,
      key: 'mode',
      hideInSearch: true,
      render: (_, record) => t(`model:clusterBackup.mode.${record.backupMode}`),
    },
    // {
    //   title: t('model:clusterBackup.property.operator'),
    //   width: 80,
    //   dataIndex: ['operator', 'operatorName'],
    //   key: 'operator',
    //   hideInSearch: true,
    // },
    {
      title: t('model:clusterBackup.property.status'),
      width: 100,
      dataIndex: 'status',
      key: 'status',
      valueType: 'select',
      valueEnum: {
        Initializing: {
          text: t('model:clusterBackup.status.initializing'),
          status: 'Default',
        },
        Processing: {
          text: t('model:clusterBackup.status.processing'),
          status: 'Processing',
        },
        Finished: {
          text: t('model:clusterBackup.status.success'),
          status: 'Success',
        },
        Failed: {
          text: t('model:clusterBackup.status.failed'),
          status: 'Error',
        },
      },
      hideInSearch: true,
    },
    {
      title: t('model:clusterBackup.property.tso'),
      width: 200,
      dataIndex: 'backupTso',
      key: 'backupTso',
      hideInSearch: true,
    },
    {
      title: t('model:clusterBackup.property.startTime'),
      width: 150,
      dataIndex: 'startTime',
      key: 'startTime',
      valueType: 'dateTime',
    },
    {
      title: t('model:clusterBackup.property.endTime'),
      width: 150,
      dataIndex: 'endTime',
      key: 'endTime',
      valueType: 'dateTime',
    },
    {
      title: t('model:clusterBackup.property.size'),
      width: 110,
      key: 'size',
      hideInSearch: true,
      render: (_, record) =>
        record.size! < 0 ? '-' : `${record.size!.toFixed(3)} MB`,
    },
    {
      title: t('model:clusterBackup.property.filepath'),
      width: 260,
      dataIndex: 'filePath',
      key: 'filepath',
      hideInSearch: true,
    },
    {
      title: t('columns.actions'),
      width: 180,
      key: 'actions',
      fixed: 'right',
      valueType: 'option',
      render(_, record) {
        const restoreDisabled = record.status !== BackupStatus.success
        const deleteDisabled =
          record.status !== BackupStatus.success &&
          record.status !== BackupStatus.failed
        const cancelDisabled =
          record.status !== BackupStatus.initializing &&
          record.status !== BackupStatus.processing

        return [
          cancelDisabled ? null : (
            <IntlPopConfirm
              key="cancel"
              placement="topRight"
              title={t('cancel.confirm')}
              icon={<QuestionCircleOutlined />}
              onConfirm={async () => {
                await cancelAction(record.id!)
              }}
            >
              <a>{t('actions.cancel')}</a>
            </IntlPopConfirm>
          ),
          restoreDisabled ? (
            <span className="disabled-text-btn" key="restore">
              {t('actions.restore')}
            </span>
          ) : (
            <IntlPopConfirm
              key="restore"
              placement="topRight"
              title={t('restore.confirm')}
              icon={<QuestionCircleOutlined />}
              onConfirm={async () => {
                restoreAction(record)
              }}
            >
              <a>{t('actions.restore')}</a>
            </IntlPopConfirm>
          ),
          deleteDisabled ? (
            <span className="disabled-text-btn" key="delete">
              {t('actions.delete')}
            </span>
          ) : (
            <DeleteConfirm
              key="delete"
              title={t('delete.name')}
              content={t('delete.confirm', { name: record.id })}
              confirmInput={{
                expect: 'delete',
              }}
              onConfirm={async (close) => {
                await deleteAction(record.id!)
                close()
              }}
            >
              <span className="danger-link">{t('actions.delete')}</span>
            </DeleteConfirm>
          ),
        ]
      },
    },
  ]
}
