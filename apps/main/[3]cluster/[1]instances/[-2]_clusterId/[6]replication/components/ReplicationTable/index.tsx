import { useMemo } from 'react'
import { Button } from 'antd'
import { PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { ColumnsState, ProColumns } from '@ant-design/pro-table'
import { Link, useHistory } from 'react-router-dom'
import { TFunction } from 'react-i18next'
import { loadI18n, useI18n } from '@i18n-macro'
import { resolveRoute } from '@pages-macro'
import {
  PagedResult,
  ClusterInfo,
  ClusterDataReplicationItem,
  ClusterDataReplicationDownstreamDisplay,
  ClusterDataReplicationStatus,
} from '@/api/model'
import { useQueryClusterDataReplicationList } from '@/api/hooks/cluster'
import { usePagination } from '@hooks/usePagination'
import { mapObj } from '@/utils/obj'
import HeavyTable from '@/components/HeavyTable'
import IntlPopConfirm from '@/components/IntlPopConfirm'
import { DeleteConfirm } from '@/components/DeleteConfirm'
import {
  useDeleteReplicationTask,
  useResumeReplicationTask,
  useSuspendReplicationTask,
} from './helper'

import styles from './index.module.less'

loadI18n()

export interface ReplicationTaskTableProps {
  cluster: ClusterInfo
}

export default function ReplicationTaskTable({
  cluster,
}: ReplicationTaskTableProps) {
  const { data, refetch, isLoading, setPagination, pagination, totalPage } =
    useFetchReplicatonTaskData(cluster.clusterId!)

  const history = useHistory()
  const { t } = useI18n()

  const columns = useTableColumns()

  return (
    <HeavyTable
      headerTitle={null}
      loading={isLoading}
      dataSource={data}
      options={{
        reload: () => refetch(),
      }}
      rowKey="id"
      columns={columns}
      columnsState={{
        persistenceKey: 'replication-table-show',
        defaultValue: defaultColumnsSetting,
      }}
      pagination={{
        pageSize: pagination.pageSize,
        current: pagination.page,
        total: totalPage,
        onChange(page, pageSize) {
          setPagination({ page, pageSize: pageSize || pagination.pageSize })
        },
      }}
      toolBarRender={() => [
        <Button
          key="new"
          icon={<PlusOutlined />}
          type="primary"
          onClick={() => history.push(resolveRoute('new', cluster.clusterId!))}
        >
          {t('toolbar.new')}
        </Button>,
      ]}
    />
  )
}

function useTableColumns() {
  const { t, i18n } = useI18n()

  const suspendAction = useSuspendReplicationTask()
  const resumeAction = useResumeReplicationTask()
  const deleteAction = useDeleteReplicationTask()

  return useMemo(
    () => getColumns({ t, suspendAction, resumeAction, deleteAction }),
    [i18n.language, suspendAction, resumeAction, deleteAction]
  )
}

function getColumns({
  t,
  deleteAction,
  suspendAction,
  resumeAction,
}: {
  t: TFunction<''>
  suspendAction: (id: string) => Promise<unknown>
  resumeAction: (id: string) => Promise<unknown>
  deleteAction: (id: string) => Promise<unknown>
}) {
  const columns: ProColumns<ClusterDataReplicationItem>[] = [
    {
      title: t('model:clusterDataReplication.property.id'),
      width: 140,
      dataIndex: 'id',
      key: 'id',
      render: (el, record) => (
        <Link to={`${resolveRoute('', record.clusterId!)}/${record.id}`}>
          {record.id}
        </Link>
      ),
    },
    {
      title: t('model:clusterDataReplication.property.name'),
      width: 120,
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('model:clusterDataReplication.property.downstream'),
      width: 120,
      dataIndex: 'downstreamType',
      key: 'downstream',
      valueEnum: mapObj(
        ClusterDataReplicationDownstreamDisplay,
        (value, type) => ({
          key: type,
          value: {
            text: value,
          },
        })
      ),
    },
    {
      title: t('model:clusterDataReplication.property.status'),
      width: 120,
      dataIndex: 'status',
      key: 'status',
      valueEnum: {
        [ClusterDataReplicationStatus.Initial]: {
          text: t('model:clusterDataReplication.status.initial'),
          status: 'Default',
        },
        [ClusterDataReplicationStatus.Stopped]: {
          text: t('model:clusterDataReplication.status.stopped'),
          status: 'Default',
        },
        [ClusterDataReplicationStatus.Normal]: {
          text: t('model:clusterDataReplication.status.running'),
          status: 'Processing',
        },
        [ClusterDataReplicationStatus.Finished]: {
          text: t('model:clusterDataReplication.status.finished'),
          status: 'Success',
        },
        [ClusterDataReplicationStatus.Failed]: {
          text: t('model:clusterDataReplication.status.failed'),
          status: 'Error',
        },
        [ClusterDataReplicationStatus.Error]: {
          text: t('model:clusterDataReplication.status.error'),
          status: 'Error',
        },
      },
    },
    {
      title: t('model:clusterDataReplication.property.time'),
      width: 180,
      key: 'time',
      renderText(text, record) {
        if (!record.upstreamUpdateTs || !record.downstreamSyncTs) {
          return
        }

        const diffBigInt =
          BigInt(record.upstreamUpdateTs) - BigInt(record.downstreamSyncTs)

        return diffBigInt.toString()
      },
    },
    {
      title: t('columns.actions'),
      valueType: 'option',
      width: 180,
      key: 'action',
      render: (_, record) => {
        // const disabled = record.status === ClusterDataReplicationStatus.Initial
        const suspendDisabled =
          record.status !== ClusterDataReplicationStatus.Normal
        const resumeDisabled =
          record.status !== ClusterDataReplicationStatus.Stopped

        return [
          <Link
            key="edit"
            to={`${resolveRoute('', record.clusterId!)}/${record.id}/edit`}
          >
            {t('actions.edit')}
          </Link>,
          <IntlPopConfirm
            key="suspend"
            title={t('suspend.confirm')}
            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
            onConfirm={() => suspendAction(record.id!)}
            disabled={suspendDisabled}
          >
            {suspendDisabled ? (
              <span className={styles.disabledLink}>
                {t('actions.suspend')}
              </span>
            ) : (
              <a>{t('actions.suspend')}</a>
            )}
          </IntlPopConfirm>,
          <IntlPopConfirm
            key="resume"
            title={t('resume.confirm')}
            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
            onConfirm={() => resumeAction(record.id!)}
            disabled={resumeDisabled}
          >
            {resumeDisabled ? (
              <span className={styles.disabledLink}>{t('actions.resume')}</span>
            ) : (
              <a>{t('actions.resume')}</a>
            )}
          </IntlPopConfirm>,
          <DeleteConfirm
            key="delete"
            title={t('delete.confirm')}
            onConfirm={async (close) => {
              await deleteAction(record.id!)
              close()
            }}
          >
            <a className="danger-link">{t('actions.delete')}</a>
          </DeleteConfirm>,
        ]
      },
    },
  ]
  return columns
}

function useFetchReplicatonTaskData(clusterId: string) {
  const [pagination, setPagination] = usePagination(20)

  const { data, isLoading, refetch } = useQueryClusterDataReplicationList(
    {
      clusterId,
      ...pagination,
    },
    { refetchOnWindowFocus: false }
  )

  const result = data?.data

  return {
    pagination,
    setPagination,
    data: result?.data,
    totalPage: (result as PagedResult)?.page?.total || 0,
    isLoading,
    refetch,
  }
}

const defaultColumnsSetting: Record<string, ColumnsState> = {}
