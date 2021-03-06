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

import { ColumnsState, ProColumns } from '@ant-design/pro-table'
import { Fragment, useCallback, useMemo, useState } from 'react'
import styles from './index.module.less'
import HeavyTable from '@/components/HeavyTable'
import {
  ClusterInfo,
  ClusterOperationStatus,
  ClusterStatus,
  PagedResult,
} from '@/api/model'
import { CopyIconButton } from '@/components/CopyToClipboard'
import { resolveRoute } from '@pages-macro'
import {
  invalidateClusterDetail,
  invalidateClustersList,
  useQueryClustersList,
  useRebootCluster,
  useStopCluster,
} from '@/api/hooks/cluster'
import { ProSchemaValueEnumObj } from '@ant-design/pro-utils/lib/typing'
import { TFunction } from 'react-i18next'
import { loadI18n, useI18n } from '@i18n-macro'
import { usePagination } from '@hooks/usePagination'
import IntlPopConfirm from '@/components/IntlPopConfirm'
import { Button } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { useQueryClient } from 'react-query'
import { mapObj } from '@/utils/obj'
import { NameAndID } from '@/components/NameAndID'

loadI18n()

export default function ClusterTable() {
  const { columns } = useTableColumn()

  const {
    data,
    refetch,
    isDataLoading,
    isPreviousData,
    setFilter,
    setPagination,
    pagination,
  } = useFetchClustersData()

  return (
    <HeavyTable
      headerTitle={null}
      loading={isDataLoading}
      className={styles.clusterTable}
      dataSource={data?.data?.data?.clusters || []}
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
      columnsState={{
        persistenceKey: 'cluster-table-show',
        defaultValue: defaultColumnsSetting,
      }}
      rowKey="clusterId"
      search={{
        filterType: 'light',
      }}
      options={{
        reload: () => refetch(),
      }}
    />
  )
}

function useFetchClustersData() {
  const [pagination, setPagination] = usePagination()
  const [filters, setFilter] = useState<{
    id?: string
    name?: string
    status?: string
    tag?: string
    type?: string
  }>({
    id: undefined,
    name: undefined,
    status: undefined,
    tag: undefined,
    type: undefined,
  })
  const { data, isLoading, isPreviousData, refetch } = useQueryClustersList(
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
    isDataLoading: isLoading,
    refetch,
  }
}

type BootType = 'boot' | 'reboot'

function useTableColumn() {
  const { t, i18n } = useI18n()

  const queryClient = useQueryClient()
  const rebootCluster = useRebootCluster()
  const stopCluster = useStopCluster()

  const bootAction = useCallback(
    (bootType: BootType, clusterId: string) =>
      rebootCluster.mutateAsync(
        {
          payload: {
            id: clusterId,
          },
          options: {
            successMessage: t(`${bootType}.success`),
            errorMessage: t(`${bootType}.failed`),
          },
        },
        {
          onSettled() {
            return Promise.allSettled([
              invalidateClustersList(queryClient),
              invalidateClusterDetail(queryClient, clusterId),
            ])
          },
        }
      ),
    [queryClient, rebootCluster.mutateAsync]
  )

  const stopAction = useCallback(
    (clusterId: string) =>
      stopCluster.mutateAsync(
        {
          payload: {
            id: clusterId,
          },
          options: {
            successMessage: t('stop.success'),
            errorMessage: t('stop.failed'),
          },
        },
        {
          onSettled() {
            return Promise.allSettled([
              invalidateClustersList(queryClient),
              invalidateClusterDetail(queryClient, clusterId),
            ])
          },
        }
      ),
    [queryClient, stopCluster.mutateAsync]
  )

  const columns = useMemo(
    // FIXME: Filter not updated in time
    () => getColumns(t, getClusterTypes(), bootAction, stopAction),
    [i18n.language, bootAction, stopAction]
  )

  return {
    columns,
  }
}

function getClusterTypes() {
  const result = {
    TiDB: {
      text: 'TiDB',
    },
  } as ProSchemaValueEnumObj

  return result
}

function getColumns(
  t: TFunction<''>,
  clusterTypes: ProColumns['valueEnum'],
  bootAction: (type: BootType, id: string) => Promise<unknown>,
  stopAction: (id: string) => Promise<unknown>
): ProColumns<ClusterInfo>[] {
  return [
    {
      title: t('model:cluster.property.id'),
      key: 'id',
      hideInTable: true,
    },
    {
      title: t('model:cluster.property.name'),
      key: 'name',
      hideInTable: true,
    },
    {
      title: `${t('model:cluster.property.id')} / ${t(
        'model:cluster.property.name'
      )}`,
      width: 200,
      fixed: 'left',
      key: 'id+name',
      hideInSearch: true,
      render: (_, record) => (
        <NameAndID
          id={record.clusterId!}
          name={record.clusterName}
          link={`${resolveRoute()}/${record.clusterId}`}
        />
      ),
    },
    {
      title: t('model:cluster.property.type'),
      width: 60,
      dataIndex: 'clusterType',
      key: 'type',
      valueType: 'select',
      valueEnum: clusterTypes,
    },
    {
      title: t('model:cluster.property.version'),
      width: 60,
      dataIndex: 'clusterVersion',
      key: 'version',
      hideInSearch: true,
    },
    {
      title: t('model:cluster.property.address'),
      width: 200,
      key: 'addresses',
      hideInSearch: true,
      render(dom, record) {
        return (
          <span className={styles.addressContainer}>
            {record.extranetConnectAddresses?.map((a) => (
              <span key={a}>
                <CopyIconButton
                  text={a}
                  label={t('model:cluster.property.address')}
                />{' '}
                {a}
              </span>
            ))}
          </span>
        )
      },
    },
    {
      title: t('model:cluster.property.status'),
      width: 80,
      dataIndex: 'status',
      key: 'status',
      valueType: 'select',
      valueEnum: {
        Initializing: {
          text: t('model:cluster.status.initializing'),
          status: 'Default',
        },
        Stopped: { text: t('model:cluster.status.stopped'), status: 'Default' },
        Running: { text: t('model:cluster.status.running'), status: 'Success' },
        Recovering: {
          text: t('model:cluster.status.recovering'),
          status: 'Warning',
        },
        Failure: {
          text: t('model:cluster.status.failure'),
          status: 'Error',
        },
      },
    },
    {
      title: t('model:cluster.property.operationStatus'),
      width: 100,
      dataIndex: 'maintainStatus',
      key: 'operationStatus',
      valueType: 'select',
      valueEnum: mapObj(ClusterOperationStatus, (fullName, k) => ({
        key: fullName,
        value: {
          text: t(`model:cluster.operationStatus.${k}`),
          status: 'Processing',
        },
      })),
      hideInSearch: true,
    },
    {
      title: t('model:cluster.property.tag'),
      width: 120,
      key: 'tag',
      render(_, record) {
        return (
          <>
            {record.tags?.map((tag) => (
              <Fragment key={tag}>
                <span>{tag}</span>
                <br />
              </Fragment>
            ))}
          </>
        )
      },
    },
    {
      title: t('model:cluster.property.tls'),
      width: 60,
      dataIndex: 'tls',
      key: 'tls',
      hideInSearch: true,
      render(_, record) {
        return record.tls
          ? t('model:cluster.tls.on')
          : t('model:cluster.tls.off')
      },
    },
    {
      title: t('model:cluster.property.createTime'),
      width: 150,
      dataIndex: 'createTime',
      key: 'createTime',
      hideInSearch: true,
      valueType: 'dateTime',
    },
    {
      title: t('model:cluster.property.updateTime'),
      width: 150,
      dataIndex: 'updateTime',
      key: 'updateTime',
      hideInSearch: true,
      valueType: 'dateTime',
    },
    {
      title: t('columns.actions'),
      width: 100,
      key: 'actions',
      valueType: 'option',
      fixed: 'right',
      render(_, record) {
        const { status, maintainStatus } = record
        const bootEnabled = status === ClusterStatus.stopped && !maintainStatus
        const rebootDisabled =
          status !== ClusterStatus.running || !!maintainStatus
        const stopDisabled = rebootDisabled

        return [
          bootEnabled ? (
            <IntlPopConfirm
              key="boot"
              placement="topRight"
              title={t('boot.confirm')}
              icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
              onConfirm={() => bootAction('boot', record.clusterId!)}
            >
              <Button className={styles.actionBtn} type="link">
                {t('actions.boot')}
              </Button>
            </IntlPopConfirm>
          ) : (
            <IntlPopConfirm
              key="reboot"
              placement="topRight"
              title={t('reboot.confirm')}
              icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
              disabled={rebootDisabled}
              onConfirm={() => bootAction('reboot', record.clusterId!)}
            >
              <Button
                className={styles.actionBtn}
                type="link"
                disabled={rebootDisabled}
              >
                {t('actions.reboot')}
              </Button>
            </IntlPopConfirm>
          ),
          <IntlPopConfirm
            key="stop"
            placement="topRight"
            title={t('stop.confirm')}
            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
            disabled={stopDisabled}
            onConfirm={() => stopAction(record.clusterId!)}
          >
            <Button
              className={styles.actionBtn}
              type="link"
              disabled={stopDisabled}
            >
              {t('actions.stop')}
            </Button>
          </IntlPopConfirm>,
        ]
      },
    },
  ]
}

const defaultColumnsSetting: Record<string, ColumnsState> = {
  tag: { show: false },
  tls: { show: false },
  createTime: { show: false },
  updateTime: { show: false },
}
