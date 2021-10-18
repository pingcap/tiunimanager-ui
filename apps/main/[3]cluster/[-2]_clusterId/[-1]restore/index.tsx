import { useHistoryWithState } from '@/router/helper'
import { resolveRoute } from '@pages-macro'
import { useCallback } from 'react'
import HeaderBar from './components/HeaderBar'
import { RestorePanel } from './components/RestorePanel'
import { InstanceapiBackupRecord } from '#/api'
import { useClusterContext } from '@apps/main/[3]cluster/[-2]_clusterId/context'
import { Redirect } from 'react-router-dom'

export default function () {
  const history = useHistoryWithState<{ backup: InstanceapiBackupRecord }>()
  const cluster = useClusterContext()
  const backPath = resolveRoute('../backup', cluster.clusterId!)
  const back = useCallback(() => history.push(backPath), [history, backPath])
  const backup = history.location.state.backup
  if (!backup) return <Redirect to={backPath} />

  return (
    <>
      <HeaderBar back={back} />
      <RestorePanel back={back} cluster={cluster} backup={backup} />
    </>
  )
}
