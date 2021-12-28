import { useHistoryWithState } from '@/router/helper'
import { resolveRoute } from '@pages-macro'
import HeaderBar from './components/HeaderBar'
import { ClusterInfo, ClusterRawTopologyItem } from '@/api/model'
import { Redirect } from 'react-router-dom'
import { ScaleOutPanel } from '@apps/main/[3]cluster/[1]instances/[-1]scale/components/ScaleOutPanel'

export default function () {
  const history = useHistoryWithState<{
    cluster: ClusterInfo
    topology: ClusterRawTopologyItem[]
    from: string
  }>()
  const { cluster, from, topology } = history.location.state
  if (!cluster) return <Redirect to={resolveRoute('../')} />
  const backPath = from || resolveRoute('../:clusterId', cluster.clusterId!)
  const backToPrevPage = () => history.push(backPath)

  return (
    <>
      <HeaderBar back={backToPrevPage} />
      <ScaleOutPanel
        cluster={cluster}
        topology={topology}
        back={backToPrevPage}
      />
    </>
  )
}
