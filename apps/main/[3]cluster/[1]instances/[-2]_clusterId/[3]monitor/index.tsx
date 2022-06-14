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

/**
 * Get the Grafana dashboard URL of the cluster
 * @param origin the Grafana origin
 * @param clusterName the cluster name
 */
function getGrafanaUrl(origin?: string, clusterName?: string) {
  if (!origin || !clusterName) {
    return ''
  }

  const { hostname, port } = new URL(origin)

  return `/grafanas-${hostname}-${port}/d/000000012/${clusterName}-tidb-summary?orgId=1&kiosk=tv`
}

export default function () {
  const { info } = useClusterContext()
  const { data } = useQueryClusterExternalService({ id: info!.clusterId! })
  const grafanaUrl = getGrafanaUrl(
    data?.data.data?.grafanaUrl,
    info?.clusterName
  )

  return grafanaUrl ? <ExternalService src={grafanaUrl} mode="card" /> : null
}
