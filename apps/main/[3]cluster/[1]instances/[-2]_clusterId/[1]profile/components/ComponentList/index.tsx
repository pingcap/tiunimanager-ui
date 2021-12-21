import { Badge, Space, Table } from 'antd'
import { ClusterComponentNodeInfo, ClusterNodeStatus } from '@/api/model'
import { loadI18n, useI18n } from '@i18n-macro'
import { TFunction } from 'react-i18next'
import styles from './index.module.less'
import { useMemo } from 'react'
import { ColumnsType } from 'antd/es/table'

loadI18n()

export type ComponentListProps = {
  nodes: ClusterComponentNodeInfo[]
}

export function ComponentList({ nodes }: ComponentListProps) {
  const { t, i18n } = useI18n()
  return useMemo(() => {
    const groups = groupNodesByType(nodes)
    return (
      <Space direction="vertical" className={styles.components}>
        {groups.map((component) => (
          <NodeTable
            key={component.type}
            title={t('list.title', { name: component.type })}
            nodes={component.nodes}
          />
        ))}
      </Space>
    )
  }, [nodes, i18n.language])
}

function groupNodesByType(nodes: ClusterComponentNodeInfo[]) {
  const result: Record<string, ClusterComponentNodeInfo[]> = Object.create(null)
  nodes.forEach((node) => {
    const arr = result[node.type!] || (result[node.type!] = [])
    arr.push(node)
  })
  return Object.keys(result).map((key) => ({
    type: key,
    nodes: result[key],
  }))
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
      rowKey="id"
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
      title: t('model:clusterNode.property.hostIp'),
      width: 140,
      key: 'addresses',
      render: (_, record) => record.addresses?.join(', '),
    },
    {
      title: t('model:clusterNode.property.status'),
      width: 80,
      dataIndex: 'status',
      key: 'status',
      render: (_, record) => {
        switch (record.status as ClusterNodeStatus) {
          case ClusterNodeStatus.initializing:
            return (
              <Badge
                status="default"
                text={t('model:cluster.status.initializing')}
              />
            )
          case ClusterNodeStatus.running:
            return (
              <Badge
                status="success"
                text={t('model:cluster.status.running')}
              />
            )
          case ClusterNodeStatus.stopped:
            return (
              <Badge
                status="default"
                text={t('model:cluster.status.stopped')}
              />
            )
          case ClusterNodeStatus.recovering:
            return (
              <Badge
                status="warning"
                text={t('model:cluster.status.recovering')}
              />
            )
          case ClusterNodeStatus.failure:
            return (
              <Badge status="error" text={t('model:cluster.status.failure')} />
            )
        }
      },
    },
    {
      title: t('model:clusterNode.property.version'),
      width: 80,
      dataIndex: 'version',
      key: 'version',
    },
    {
      title: t('model:clusterNode.property.port'),
      width: 80,
      key: 'ports',
      render: (_, record) => record.ports?.join(', '),
    },
  ]
}
