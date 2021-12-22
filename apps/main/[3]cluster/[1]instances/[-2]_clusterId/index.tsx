import { Redirect } from 'react-router-dom'
import { resolveRoute } from '@pages-macro'
import { useClusterContext } from '@apps/main/[3]cluster/[1]instances/[-2]_clusterId/context'

export default function Index() {
  const { info } = useClusterContext()
  return <Redirect to={resolveRoute('./profile', info!.clusterId!)} />
}
