import { FC } from 'react'
import { loadI18n, useI18n } from '@i18n-macro'
import { Badge, Card, Col, Row, Spin } from 'antd'
import { useQueryClusterDataReplicationDetail } from '@/api/hooks/cluster'
import {
  ClusterDataReplicationDetail,
  ClusterDataReplicationStatus,
  ClusterDownstreamKafka,
  ClusterDownstreamMySQL,
  ClusterDownstreamTiDB,
} from '@/api/model'

import styles from './index.module.less'

loadI18n()

const getTaskStatus = (taskStatus: ClusterDataReplicationStatus) => {
  const hashmap = {
    [ClusterDataReplicationStatus.Initial]: {
      status: 'default',
      text: 'initial',
    },
    [ClusterDataReplicationStatus.Normal]: {
      status: 'processing',
      text: 'running',
    },
    [ClusterDataReplicationStatus.Stopped]: {
      status: 'default',
      text: 'stopped',
    },
    [ClusterDataReplicationStatus.Finished]: {
      status: 'sucecss',
      text: 'finished',
    },
    [ClusterDataReplicationStatus.Failed]: {
      status: 'error',
      text: 'failed',
    },
    [ClusterDataReplicationStatus.Error]: {
      status: 'error',
      text: 'error',
    },
  }

  const { status = 'default', text = taskStatus } = hashmap[taskStatus] || {}

  return {
    status,
    text,
  }
}

const getTSODisplay = (tso: number | string) => {
  const physicalTimestamp = Number((BigInt(tso) >> 18n).toString())

  return physicalTimestamp
    ? `${tso}, ${new Date(physicalTimestamp).toLocaleString()}`
    : '-'
}

const DescItem: FC<{ label: string }> = (props) => (
  <Row className={styles.descRow}>
    <Col className={styles.descCol} flex="260px">
      <span className={styles.descLabel}>{props.label} :</span>
    </Col>
    <Col flex="auto">{props.children}</Col>
  </Row>
)

const BasicDesc: FC<{ data: ClusterDataReplicationDetail }> = ({ data }) => {
  const { t } = useI18n()

  const { status: badgeStatus, text: transText } = getTaskStatus(
    data.status as any
  )

  const filterRuleList = data.rules?.filter((rule) => rule)

  return (
    <Card className={styles.descCard} title={t('basic.title')}>
      <DescItem label={t('basic.fields.id')}>{data.id}</DescItem>
      <DescItem label={t('basic.fields.name')}>{data.name}</DescItem>
      <DescItem label={t('basic.fields.status')}>
        <Badge
          status={badgeStatus as any}
          text={t(`model:clusterDataReplication.status.${transText}`)}
        />
      </DescItem>
      <DescItem label={t('basic.fields.tso')}>
        {data.startTS ? getTSODisplay(data.startTS) : '-'}
      </DescItem>
      <DescItem label={t('basic.fields.filterRule')}>
        {filterRuleList?.length
          ? filterRuleList.map((rule, idx) => (
              <Badge key={`${idx}-${rule}`} status="default" text={rule} />
            ))
          : '-'}
      </DescItem>
      <DescItem label={t('basic.fields.latestUpstreamTSO')}>
        {data.upstreamUpdateTs ? getTSODisplay(data.upstreamUpdateTs) : '-'}
      </DescItem>
      <DescItem label={t('basic.fields.latestFetchTSO')}>
        {data.downstreamFetchTs ? getTSODisplay(data.downstreamFetchTs) : '-'}
      </DescItem>
      <DescItem label={t('basic.fields.latestSyncTSO')}>
        {data.downstreamSyncTs ? getTSODisplay(data.downstreamSyncTs) : '-'}
      </DescItem>
    </Card>
  )
}

const DBDesc: FC<{
  db: 'mysql' | 'tidb'
  data: ClusterDownstreamMySQL | ClusterDownstreamTiDB
}> = ({ db, data }) => {
  const { t } = useI18n()

  return (
    <>
      <DescItem label={t(`${db}.fields.url`)}>{data.ip}</DescItem>
      <DescItem label={t(`${db}.fields.port`)}>{data.port}</DescItem>
      <DescItem label={t(`${db}.fields.user`)}>{data.username}</DescItem>
      <DescItem label={t(`${db}.fields.thread`)}>
        {data.concurrentThreads}
      </DescItem>
    </>
  )
}

const MySQLDesc: FC<{ data: ClusterDownstreamMySQL }> = ({ data }) => (
  <DBDesc db="mysql" data={data} />
)

const TiDBDesc: FC<{ data: ClusterDownstreamTiDB }> = ({ data }) => (
  <DBDesc db="tidb" data={data} />
)

const KafkaDesc: FC<{ data: ClusterDownstreamKafka }> = ({ data }) => {
  const { t } = useI18n()

  const dispatchRuleList = data.dispatchers?.filter(
    (item) => item.dispatcher && item.matcher
  )

  return (
    <>
      <DescItem label={t('kafka.fields.url')}>{data.ip}</DescItem>
      <DescItem label={t('kafka.fields.port')}>{data.port}</DescItem>
      <DescItem label={t('kafka.fields.version')}>{data.version}</DescItem>
      <DescItem label={t('kafka.fields.clientId')}>{data.clientId}</DescItem>
      <DescItem label={t('kafka.fields.topic')}>{data.topicName}</DescItem>
      <DescItem label={t('kafka.fields.protocol')}>{data.protocol}</DescItem>
      <DescItem label={t('kafka.fields.partition')}>
        {data.partitions ?? '-'}
      </DescItem>
      <DescItem label={t('kafka.fields.replica')}>
        {data.replicationFactor ?? '-'}
      </DescItem>
      <DescItem label={t('kafka.fields.maxMsgSize')}>
        {data.maxMessageBytes ?? '-'}
      </DescItem>
      <DescItem label={t('kafka.fields.maxMsgNum')}>
        {data.maxBatchSize ?? '-'}
      </DescItem>
      <DescItem label={t('kafka.fields.dispatchRule')}>
        {dispatchRuleList?.length
          ? dispatchRuleList.map((item, idx) => {
              const dispatcher = `${t('kafka.dispatchRule.dispatcher')}: ${
                item.dispatcher
              }`
              const matcher = `${t('kafka.dispatchRule.matcher')}: ${
                item.matcher
              }`
              const text = `${dispatcher}, ${matcher}`

              return <Badge key={idx} status="default" text={text} />
            })
          : '-'}
      </DescItem>
    </>
  )
}

const DownstreamDesc: FC<{ data: ClusterDataReplicationDetail }> = ({
  data,
}) => {
  const { t } = useI18n()
  const downstreams = {
    mysql: (data: any) => <MySQLDesc data={data} />,
    tidb: (data: any) => <TiDBDesc data={data} />,
    kafka: (data: any) => <KafkaDesc data={data} />,
  }

  return (
    <Card className={styles.descCard} title={t('downstream.title')}>
      <DescItem label={t('downstream.fields.type')}>
        {data.downstreamType}
      </DescItem>
      {downstreams[data.downstreamType!](data.downstream)}
    </Card>
  )
}

const useFetchReplicationDetail = ({ taskId }: { taskId: string }) => {
  const { data, isLoading } = useQueryClusterDataReplicationDetail(
    {
      id: taskId,
    },
    {
      refetchOnWindowFocus: false,
      enabled: !!taskId,
    }
  )
  const result = data?.data.data

  return {
    data: result || {},
    isLoading,
  }
}

interface DetailPanelProps {
  taskId: string
}

const DetailPanel: FC<DetailPanelProps> = ({ taskId }) => {
  const { data, isLoading } = useFetchReplicationDetail({ taskId })

  if (isLoading) {
    return <Spin />
  }

  return (
    <div className={styles.detailPanel}>
      <BasicDesc data={data} />
      <DownstreamDesc data={data} />
    </div>
  )
}

export default DetailPanel
