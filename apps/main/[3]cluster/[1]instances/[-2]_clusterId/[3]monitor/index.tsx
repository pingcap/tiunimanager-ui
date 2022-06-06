/*
 * Copyright 2022 PingCAP, Inc.
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

import { ExternalService } from '@/components/ExternalService'
import { useQueryClusterExternalService } from '@/api/hooks/cluster'
import { useClusterContext } from '@apps/main/[3]cluster/[1]instances/[-2]_clusterId/context'

export default function () {
  const { info } = useClusterContext()
  const { data } = useQueryClusterExternalService({ id: info!.clusterId! })
  const grafanaUrl = data?.data.data?.grafanaUrl
    ? `${data?.data.data?.grafanaUrl}/d/000000012/${
        info!.clusterName
      }-tidb-summary?orgId=1&kiosk=tv`
    : ''
  return <ExternalService src={grafanaUrl} mode="card" />
}
