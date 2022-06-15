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
