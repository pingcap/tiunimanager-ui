import { ColumnsState, ProColumns } from '@ant-design/pro-table'
import { Fragment, useCallback, useMemo, useState } from 'react'
import styles from './index.module.less'
import HeavyTable from '@/components/HeavyTable'
import {
  ClusterInfo,
  ClusterOperationStatus,
  ClusterStatus,
  KnowledgeOfClusterType,
  PagedResult,
} from '@/api/model'
import { CopyIconButton } from '@/components/CopyToClipboard'
import { Link } from 'react-router-dom'
import { resolveRoute } from '@pages-macro'
import { useQueryKnowledge } from '@/api/hooks/knowledge'
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

loadI18n()

export default function ClusterTable() {
  const { columns, isKnowledgeLoading } = useTableColumn()

  const {
    data,
    refetch,
    isDataLoading,
    isPreviousData,
    setFilter,
    setPagination,
    pagination,
  } = useFetchClustersData()

  const isLoading = isDataLoading || isKnowledgeLoading

  return (
    <HeavyTable
      headerTitle={null}
      loading={isLoading}
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
  const { data, isLoading } = useQueryKnowledge()

  const queryClient = useQueryClient()
  const rebootCluster = useRebootCluster()
  const stopCluster = useStopCluster()

  const bootAction = useCallback(
    (bootType: BootType, clusterId: string) =>
      rebootCluster.mutateAsync(
        {
          id: clusterId,
          options: {
            actionName: t(`${bootType}.name`),
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
          id: clusterId,
          options: {
            actionName: t('stop.name'),
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
    () =>
      getColumns(
        t,
        getClusterTypes(data?.data?.data || []),
        bootAction,
        stopAction
      ),
    [i18n.language, isLoading, bootAction, stopAction]
  )

  return {
    columns,
    isKnowledgeLoading: isLoading,
  }
}

function getClusterTypes(raw: KnowledgeOfClusterType[]) {
  const result = {} as ProSchemaValueEnumObj
  raw.forEach(
    (r) =>
      (result[r.clusterType!.code!] = {
        text: r.clusterType!.name!,
      })
  )
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
      title: 'ID',
      width: 180,
      dataIndex: 'clusterId',
      key: 'id',
      render: (_, record) => (
        <Link to={`${resolveRoute()}/${record.clusterId}`}>
          {record.clusterId}
        </Link>
      ),
    },
    {
      title: t('model:cluster.property.name'),
      width: 120,
      dataIndex: 'clusterName',
      key: 'name',
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
      title: t('model:cluster.property.status'),
      width: 100,
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
      title: t('model:cluster.property.address'),
      width: 160,
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
    // TODO: wait for the cluster usage support
    // {
    //   title: t('model:cluster.property.usage'),
    //   key: 'usage',
    //   width: 300,
    //   hideInSearch: true,
    //   render(dom, record) {
    //     return (
    //       <span className={styles.usageCircleContainer}>
    //         {record.cpuUsage && (
    //           <SmallUsageCircle
    //             total={record.cpuUsage.total!}
    //             usageRate={record.cpuUsage.usageRate!}
    //             used={record.cpuUsage.used!}
    //             name={t('usage.cpu')}
    //             unit=""
    //           />
    //         )}
    //         {record.memoryUsage && (
    //           <SmallUsageCircle
    //             total={record.memoryUsage.total!}
    //             usageRate={record.memoryUsage.usageRate!}
    //             used={record.memoryUsage.used!}
    //             name={t('usage.mem')}
    //             unit="MB"
    //           />
    //         )}
    //         {record.diskUsage && (
    //           <SmallUsageCircle
    //             total={record.diskUsage.total!}
    //             usageRate={record.diskUsage.usageRate!}
    //             used={record.diskUsage.used!}
    //             name={t('usage.disk')}
    //             unit="MB"
    //           />
    //         )}
    //         {record.backupFileUsage && (
    //           <SmallUsageCircle
    //             total={record.backupFileUsage.total!}
    //             usageRate={record.backupFileUsage.usageRate!}
    //             used={record.backupFileUsage.used!}
    //             name={t('usage.backup')}
    //             unit="MB"
    //           />
    //         )}
    //         {record.storageUsage && (
    //           <SmallUsageCircle
    //             total={record.storageUsage.total!}
    //             usageRate={record.storageUsage.usageRate!}
    //             used={record.storageUsage.used!}
    //             name={t('usage.storage')}
    //             unit="MB"
    //           />
    //         )}
    //       </span>
    //     )
    //   },
    // },
    {
      title: t('model:cluster.property.createTime'),
      width: 180,
      dataIndex: 'createTime',
      key: 'createTime',
      hideInSearch: true,
      valueType: 'dateTime',
    },
    {
      title: t('model:cluster.property.updateTime'),
      width: 180,
      dataIndex: 'updateTime',
      key: 'updateTime',
      hideInSearch: true,
      valueType: 'dateTime',
    },
    {
      title: t('model:cluster.property.deleteTime'),
      width: 180,
      dataIndex: 'deleteTime',
      key: 'deleteTime',
      hideInSearch: true,
      valueType: 'dateTime',
    },
    {
      title: t('columns.actions'),
      width: 120,
      key: 'actions',
      valueType: 'option',
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
              title={t('boot.confirm')}
              icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
              cancelButtonProps={{ size: 'middle' }}
              okButtonProps={{ size: 'middle' }}
              onConfirm={() => bootAction('boot', record.clusterId!)}
            >
              <Button className={styles.actionBtn} type="link">
                {t('actions.boot')}
              </Button>
            </IntlPopConfirm>
          ) : (
            <IntlPopConfirm
              key="reboot"
              title={t('reboot.confirm')}
              icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
              disabled={rebootDisabled}
              cancelButtonProps={{ size: 'middle' }}
              okButtonProps={{ size: 'middle' }}
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
            title={t('stop.confirm')}
            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
            disabled={stopDisabled}
            cancelButtonProps={{ size: 'middle' }}
            okButtonProps={{ size: 'middle' }}
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
  actions: { fixed: 'right' },
  deleteTime: { show: false },
  dbPassword: { show: false },
  backup: { show: false },
  updateTime: { show: false },
  password: { show: false },
  tag: { show: false },
  tls: { show: false },
}
