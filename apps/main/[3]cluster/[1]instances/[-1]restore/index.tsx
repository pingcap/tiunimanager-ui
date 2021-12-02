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
