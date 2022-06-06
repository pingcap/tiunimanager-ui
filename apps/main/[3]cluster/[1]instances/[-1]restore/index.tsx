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

import { useHistoryWithState } from '@/router/helper'
import { resolveRoute } from '@pages-macro'
import HeaderBar from './components/HeaderBar'
import { RestorePanel } from './components/RestorePanel'
import { ClusterBackupItem, ClusterInfo } from '@/api/model'
import { Redirect } from 'react-router-dom'

export default function () {
  const history =
    useHistoryWithState<{ backup: ClusterBackupItem; cluster: ClusterInfo }>()
  const { backup, cluster } = history.location.state
  if (!backup || !cluster) return <Redirect to={resolveRoute('../')} />
  const backPath = resolveRoute('../:clusterId/backup', backup.clusterId!)
  const backToPrevPage = () => history.push(backPath)

  return (
    <>
      <HeaderBar back={backToPrevPage} />
      <RestorePanel back={backToPrevPage} cluster={cluster} backup={backup} />
    </>
  )
}
