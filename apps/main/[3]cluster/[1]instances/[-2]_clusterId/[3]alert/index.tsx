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
import { useClusterContext } from '@apps/main/[3]cluster/[1]instances/[-2]_clusterId/context'
import { useQueryClusterExternalService } from '@/api/hooks/cluster'

export default function () {
  const { info } = useClusterContext()
  const { data } = useQueryClusterExternalService({ id: info!.clusterId! })
  const alertUrl = data?.data.data?.alertUrl || ''
  return <ExternalService src={alertUrl} mode="card" />
}
