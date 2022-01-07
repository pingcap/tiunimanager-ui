import { Badge, Space } from 'antd'
import { ClusterComponentNodeInfo, ClusterNodeStatus } from '@/api/model'
import { loadI18n, useI18n } from '@i18n-macro'
import { TFunction, Trans } from 'react-i18next'
import styles from './index.module.less'
import { useCallback, useMemo } from 'react'
import HeavyTable from '@/components/HeavyTable'
import { ProColumns } from '@ant-design/pro-table'
import { useQueryClient } from 'react-query'
import { invalidateClusterDetail, useClusterScaleIn } from '@/api/hooks/cluster'
import IntlPopConfirm from '@/components/IntlPopConfirm'

loadI18n()

export type ComponentListProps = {
  clusterId: string
  nodes: ClusterComponentNodeInfo[]
}

export function ComponentList({ nodes, clusterId }: ComponentListProps) {
  const queryClient = useQueryClient()
  const scaleIn = useClusterScaleIn()
  const { t, i18n } = useI18n()

  const onScaleIn = useCallback(
    (instanceId: string) => {
      scaleIn.mutateAsync(
        {
          clusterId,
          instanceId,
          options: {
            actionName: t('scaleIn.name'),
          },
        },
        {
          async onSuccess() {
            await invalidateClusterDetail(queryClient, clusterId)
          },
        }
      )
    },
    [clusterId, scaleIn.mutateAsync, queryClient]
  )

  return useMemo(() => {
    const groups = groupNodesByType(nodes)
    return (
      <Space direction="vertical" className={styles.components}>
        {groups.map((component) => (
          <NodeTable
            key={component.type}
            title={t('list.title', { name: component.type })}
            nodes={component.nodes}
            onScaleIn={onScaleIn}
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
  onScaleIn: (instanceId: string) => unknown
  title: string
}

function NodeTable({ nodes = [], title, onScaleIn }: NodeTableProps) {
  const { t, i18n } = useI18n()

  const columns = useMemo(
    () =>
      getColumns({
        t,
        onScaleIn,
        nodesLen: nodes.length,
      }),
    [i18n.language, onScaleIn, nodes.length]
  )

  return (
    <HeavyTable
      size="small"
      title={() => title}
      className={styles.clusterTable}
      dataSource={nodes}
      columns={columns}
      rowKey="id"
      toolBarRender={false}
      pagination={false}
      bordered={true}
    />
  )
}

function getColumns({
  t,
  onScaleIn,
  nodesLen,
}: {
  t: TFunction<''>
  onScaleIn: (instanceId: string) => unknown
  nodesLen: number
}): ProColumns<ClusterComponentNodeInfo>[] {
  return [
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
      width: 120,
      dataIndex: 'version',
      key: 'version',
    },
    {
      title: t('model:clusterNode.property.port'),
      width: 120,
      key: 'ports',
      render: (_, record) => record.ports?.join(', '),
    },
    {
      title: t('columns.actions'),
      width: 40,
      key: 'actions',
      valueType: 'option',
      render(_, record) {
        if (nodesLen <= 1) {
          return [
            <span className="disabled-text-btn" key="scaleIn">
              {t('actions.scaleIn')}
            </span>,
          ]
        }

        const isPD = record.type === 'PD'
        const title = isPD ? (
          <Trans
            t={t}
            i18nKey="scaleIn.confirm.pd"
            values={{
              ip: record.addresses?.[0] || 'unknown host',
            }}
            components={{ caution: <span className="danger-link"></span> }}
          />
        ) : (
          <Trans
            t={t}
            i18nKey="scaleIn.confirm.common"
            values={{
              type: record.type,
              ip: record.addresses?.[0] || 'unknown host',
            }}
          />
        )

        return [
          <IntlPopConfirm
            key="scaleIn"
            title={title}
            onConfirm={() => onScaleIn(record.id!)}
          >
            <a>{t('actions.scaleIn')}</a>
          </IntlPopConfirm>,
        ]
      },
    },
  ]
}
