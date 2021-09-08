import { ColumnsState, ProColumns } from '@ant-design/pro-table'
import { Fragment, useCallback, useMemo, useState } from 'react'
import { message } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'
import styles from './index.module.less'
import HeavyTable from '@/components/HeavyTable'
import {
  ClusterapiClusterDisplayInfo,
  ControllerResultWithPage,
  KnowledgeClusterTypeSpec,
} from '#/api'
import { CopyIconButton } from '@/components/CopyToClipboard'
import useLocalStorage from '@hooks/useLocalstorage'
import { Link } from 'react-router-dom'
import { resolveRoute } from '@pages-macro'
import { useQueryKnowledge } from '@/api/knowledge'
import { useQueryClient } from 'react-query'
import {
  invalidateClusterDetail,
  invalidateClustersList,
  useDeleteCluster,
  useQueryClustersList,
} from '@/api/cluster'
import IntlPopConfirm from '@/components/IntlPopConfirm'
import { ProSchemaValueEnumObj } from '@ant-design/pro-utils/lib/typing'
import { TFunction } from 'react-i18next'
import { loadI18n, useI18n } from '@i18n-macro'
import { errToMsg } from '@/utils/error'
import { SmallUsageCircle } from '@/components/UsageCircle'
import { usePagination } from '@hooks/usePagination'

loadI18n()

export default function ClusterTable() {
  const { columns, isKnowledgeLoading, columnsSetting, setColumnSetting } =
    useTableColumn()

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
      dataSource={data?.data?.data || []}
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
      columnsStateMap={columnsSetting}
      onColumnsStateChange={setColumnSetting}
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

function useTableColumn() {
  const { t, i18n } = useI18n()
  const { data, isLoading } = useQueryKnowledge()

  const [columnsSetting, setColumnSetting] = useLocalStorage(
    'cluster-table-show',
    defaultColumnsSetting
  )

  const deleteCluster = useDeleteCluster()
  const queryClient = useQueryClient()
  const deleteAction = useCallback(
    (clusterId) =>
      deleteCluster.mutateAsync(
        { id: clusterId },
        {
          onSuccess(data) {
            message.success(t('delete.success', { msg: data.data.data })).then()
          },
          onSettled() {
            return Promise.allSettled([
              invalidateClustersList(queryClient),
              invalidateClusterDetail(queryClient, clusterId),
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
    [queryClient, deleteCluster.mutateAsync]
  )

  const columns = useMemo(
    () => getColumns(t, getClusterTypes(data?.data?.data || []), deleteAction),
    [i18n.language, isLoading, deleteAction]
  )

  return {
    columns,
    isKnowledgeLoading: isLoading,
    columnsSetting,
    setColumnSetting,
  }
}

function getClusterTypes(raw: KnowledgeClusterTypeSpec[]) {
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
  deleteAction: (clusterId: string) => void
): ProColumns<ClusterapiClusterDisplayInfo>[] {
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
      title: t('columns.name'),
      width: 120,
      dataIndex: 'clusterName',
      key: 'name',
    },
    {
      title: t('columns.status'),
      width: 100,
      dataIndex: 'statusCode',
      key: 'status',
      valueType: 'select',
      valueEnum: {
        '0': { text: t('status.idle'), status: 'Default' },
        '1': { text: t('status.online'), status: 'Success' },
        '2': { text: t('status.offline'), status: 'Warning' },
        '3': { text: t('status.deleted'), status: 'Error' },
        CreateCluster: {
          text: t('status.CreateCluster'),
          status: 'Processing',
        },
        DeleteCluster: {
          text: t('status.DeleteCluster'),
          status: 'Processing',
        },
        BackupCluster: {
          text: t('status.BackupCluster'),
          status: 'Processing',
        },
        RecoverCluster: {
          text: t('status.RecoverCluster'),
          status: 'Processing',
        },
        ModifyParameters: {
          text: t('status.ModifyParameters'),
          status: 'Processing',
        },
        ExportData: { text: t('status.ExportData'), status: 'Processing' },
        ImportData: { text: t('status.ImportData'), status: 'Processing' },
      },
    },
    {
      title: t('columns.addresses'),
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
                  tip={t('addresses.copy')}
                  message={t('addresses.success')}
                />{' '}
                {a}
              </span>
            ))}
          </span>
        )
      },
    },
    {
      title: t('columns.password'),
      width: 60,
      dataIndex: 'dbPassword',
      key: 'password',
      hideInSearch: true,
      render(_, record) {
        return record.dbPassword ? (
          <span>
            <CopyIconButton
              text={record.dbPassword}
              tip={t('password.copy')}
              message={t('password.success')}
            />
          </span>
        ) : (
          ''
        )
      },
    },
    {
      title: t('columns.tag'),
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
      title: t('columns.port'),
      width: 60,
      dataIndex: 'port',
      key: 'port',
      hideInSearch: true,
    },
    {
      title: t('columns.version'),
      width: 60,
      dataIndex: 'clusterVersion',
      key: 'version',
      hideInSearch: true,
    },
    {
      title: t('columns.type'),
      width: 60,
      dataIndex: 'clusterType',
      key: 'type',
      valueType: 'select',
      valueEnum: clusterTypes,
    },
    {
      title: t('columns.createTime'),
      width: 180,
      dataIndex: 'createTime',
      key: 'createTime',
      hideInSearch: true,
      valueType: 'dateTime',
    },
    {
      title: t('columns.updateTime'),
      width: 180,
      dataIndex: 'updateTime',
      key: 'updateTime',
      hideInSearch: true,
      valueType: 'dateTime',
    },
    {
      title: t('columns.deleteTime'),
      width: 180,
      dataIndex: 'deleteTime',
      key: 'deleteTime',
      hideInSearch: true,
      valueType: 'dateTime',
    },
    {
      title: t('columns.tls'),
      width: 60,
      dataIndex: 'tls',
      key: 'tls',
      hideInSearch: true,
      render(_, record) {
        return record.tls ? t('tls.on') : t('tls.off')
      },
    },
    {
      title: t('columns.usage'),
      key: 'usage',
      width: 300,
      hideInSearch: true,
      render(dom, record) {
        return (
          <span className={styles.usageCircleContainer}>
            {record.cpuUsage && (
              <SmallUsageCircle
                total={record.cpuUsage.total!}
                usageRate={record.cpuUsage.usageRate!}
                used={record.cpuUsage.used!}
                name={t('usage.cpu')}
                unit=""
              />
            )}
            {record.memoryUsage && (
              <SmallUsageCircle
                total={record.memoryUsage.total!}
                usageRate={record.memoryUsage.usageRate!}
                used={record.memoryUsage.used!}
                name={t('usage.mem')}
                unit="MB"
              />
            )}
            {record.diskUsage && (
              <SmallUsageCircle
                total={record.diskUsage.total!}
                usageRate={record.diskUsage.usageRate!}
                used={record.diskUsage.used!}
                name={t('usage.disk')}
                unit="MB"
              />
            )}
            {record.backupFileUsage && (
              <SmallUsageCircle
                total={record.backupFileUsage.total!}
                usageRate={record.backupFileUsage.usageRate!}
                used={record.backupFileUsage.used!}
                name={t('usage.backup')}
                unit="MB"
              />
            )}
            {record.storageUsage && (
              <SmallUsageCircle
                total={record.storageUsage.total!}
                usageRate={record.storageUsage.usageRate!}
                used={record.storageUsage.used!}
                name={t('usage.storage')}
                unit="MB"
              />
            )}
          </span>
        )
      },
    },
    {
      title: t('columns.actions'),
      width: 140,
      key: 'actions',
      valueType: 'option',
      render(_, record) {
        return [
          // TODO: implement actions in cluster list
          <a key="edit">{t('actions.edit')}</a>,
          <a key="reboot">{t('actions.reboot')}</a>,
          <IntlPopConfirm
            key="delete"
            title={t('delete.confirm')}
            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
            onConfirm={async () => {
              await deleteAction(record.clusterId!)
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
  updateTime: {
    show: false,
  },
  deleteTime: {
    show: false,
  },
  tls: {
    show: false,
  },
  password: {
    show: false,
  },
  actions: {
    fixed: 'right',
  },
}
