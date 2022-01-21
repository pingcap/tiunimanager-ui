import {
  ClusterDataReplicationDownstreamType,
  ClusterDownstreamKafka,
  ClusterDownstreamMySQL,
  ClusterDownstreamTiDB,
} from '@/api/model'

export type EditMode = 'new' | 'edit'

export type EditStaticData = {
  taskId: string
}

export type EditFormDownstream = {
  mysql: ClusterDownstreamMySQL
  tidb: ClusterDownstreamTiDB
  kafka: ClusterDownstreamKafka
}

export interface EditFormFields {
  name: string
  tso: string
  filterRuleList: string[]
  downstreamType: ClusterDataReplicationDownstreamType
  downstream: EditFormDownstream
}

export type EditInitialValues = Partial<Omit<EditFormFields, 'downstream'>> & {
  downstream: Partial<EditFormDownstream>
}

export type EditSumbitValues = Omit<EditFormFields, 'downstream'> & {
  downstream: EditFormDownstream[keyof EditFormDownstream]
}
