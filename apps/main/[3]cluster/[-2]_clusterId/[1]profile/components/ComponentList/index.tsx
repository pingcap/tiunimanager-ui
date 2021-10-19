import { Space, Table } from 'antd'
import { ResponseClusterDetail, ClusterComponentNodeInfo } from '@/api/model'
import { loadI18n, useI18n } from '@i18n-macro'
import { TFunction } from 'react-i18next'
import styles from './index.module.less'
import { SmallUsageCircle } from '@/components/UsageCircle'
import { useMemo } from 'react'
import { ColumnsType } from 'antd/es/table'

loadI18n()

export type ComponentListProps = {
  cluster: ResponseClusterDetail
}

export function ComponentList({ cluster }: ComponentListProps) {
  const { t, i18n } = useI18n()
  return useMemo(
    () => (
      <Space direction="vertical" className={styles.components}>
        {cluster.components?.map((component) => (
          <NodeTable
            key={component.componentType}
            title={t('list.title', { name: component.componentName })}
            nodes={component.nodes}
          />
        ))}
      </Space>
    ),
    [cluster, i18n.language]
  )
}

type NodeTableProps = {
  nodes?: ClusterComponentNodeInfo[]
  title: string
}

function NodeTable({ nodes = [], title }: NodeTableProps) {
  const columns = useColumns()
  return (
    <Table
      size="small"
      title={() => title}
      className={styles.clusterTable}
      dataSource={nodes}
      columns={columns}
      rowKey="nodeId"
      pagination={false}
      bordered={true}
    />
  )
}

function useColumns() {
  const { t, i18n } = useI18n()
  return useMemo(() => getColumns(t), [i18n.language])
}

function getColumns(t: TFunction<''>): ColumnsType<ClusterComponentNodeInfo> {
  return [
    // Note: hide some fields now
    // {
    //   title: t('columns.id'),
    //   width: 140,
    //   dataIndex: 'nodeId',
    //   key: 'id',
    // },
    {
      title: t('columns.hostId'),
      width: 140,
      dataIndex: 'hostId',
      key: 'hostId',
    },
    // {
    //   title: t('columns.zone'),
    //   width: 120,
    //   dataIndex: ['zone', 'zoneName'],
    //   key: 'zone',
    // },
    // {
    //   title: t('columns.spec'),
    //   width: 100,
    //   dataIndex: ['spec', 'specName'],
    //   key: 'spec',
    // },
    {
      title: t('columns.status'),
      width: 80,
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: t('columns.version'),
      width: 80,
      dataIndex: 'version',
      key: 'version',
    },
    {
      title: t('columns.port'),
      width: 80,
      dataIndex: 'port',
      key: 'port',
    },
    {
      title: t('columns.iops'),
      width: 80,
      key: 'iops',
      render: (_, record) =>
        record.iops && `${record.iops[0]} / ${record.iops[1]}`,
    },
    {
      title: t('columns.ioutil'),
      width: 80,
      dataIndex: 'ioUtil',
      key: 'ioUtil',
    },
    {
      title: t('columns.usage'),
      key: 'usage',
      width: 180,
      render(dom, record) {
        return (
          <span className={styles.usageCircleContainer}>
            {record.memoryUsage && (
              <SmallUsageCircle
                total={record.memoryUsage.total!}
                usageRate={record.memoryUsage.usageRate!}
                used={record.memoryUsage.used!}
                name={t('usage.mem')}
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
  ]
}
