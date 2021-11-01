import { ColumnsState, ProColumns } from '@ant-design/pro-table'
import { Fragment, useMemo, useState } from 'react'
import styles from './index.module.less'
import HeavyTable from '@/components/HeavyTable'
import { ClusterInfo, PagedResult, KnowledgeOfClusterType } from '@/api/model'
import { CopyIconButton } from '@/components/CopyToClipboard'
import useLocalStorage from '@hooks/useLocalstorage'
import { Link } from 'react-router-dom'
import { resolveRoute } from '@pages-macro'
import { useQueryKnowledge } from '@/api/hooks/knowledge'
import { useQueryClustersList } from '@/api/hooks/cluster'
import { ProSchemaValueEnumObj } from '@ant-design/pro-utils/lib/typing'
import { TFunction } from 'react-i18next'
import { loadI18n, useI18n } from '@i18n-macro'
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

  console.log(columns)
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
        total: (data?.data as PagedResult)?.page?.total || 0,
        onChange(page, pageSize) {
          if (!isPreviousData)
            setPagination({ page, pageSize: pageSize || pagination.pageSize })
        },
      }}
      columnsState={columnsSetting}
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

  const columns = useMemo(
    // FIXME: Filter not updated in time
    () => getColumns(t, getClusterTypes(data?.data?.data || [])),
    [i18n.language, isLoading]
  )

  return {
    columns,
    isKnowledgeLoading: isLoading,
    columnsSetting: {
      value: columnsSetting,
    },
    setColumnSetting,
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
  clusterTypes: ProColumns['valueEnum']
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
      dataIndex: 'statusCode',
      key: 'status',
      valueType: 'select',
      valueEnum: {
        '0': { text: t('model:cluster.status.idle'), status: 'Default' },
        '1': { text: t('model:cluster.status.online'), status: 'Success' },
        '2': { text: t('model:cluster.status.offline'), status: 'Warning' },
        '3': { text: t('model:cluster.status.deleted'), status: 'Error' },
        CreateCluster: {
          text: t('model:cluster.status.CreateCluster'),
          status: 'Processing',
        },
        DeleteCluster: {
          text: t('model:cluster.status.DeleteCluster'),
          status: 'Processing',
        },
        BackupCluster: {
          text: t('model:cluster.status.BackupCluster'),
          status: 'Processing',
        },
        RecoverCluster: {
          text: t('model:cluster.status.RecoverCluster'),
          status: 'Processing',
        },
        ModifyParameters: {
          text: t('model:cluster.status.ModifyParameters'),
          status: 'Processing',
        },
        ExportData: {
          text: t('model:cluster.status.ExportData'),
          status: 'Processing',
        },
        ImportData: {
          text: t('model:cluster.status.ImportData'),
          status: 'Processing',
        },
      },
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
      title: t('model:cluster.property.password'),
      width: 60,
      dataIndex: 'dbPassword',
      key: 'password',
      hideInSearch: true,
      render(_, record) {
        return record.dbPassword ? (
          <span>
            <CopyIconButton
              text={record.dbPassword}
              label={t('model:cluster.property.password')}
            />
          </span>
        ) : (
          ''
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
      width: 100,
      key: 'actions',
      valueType: 'option',
      render() {
        return [
          // TODO: implement actions in cluster list
          <a key="edit">{t('actions.edit')}</a>,
          <a key="reboot">{t('actions.reboot')}</a>,
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
