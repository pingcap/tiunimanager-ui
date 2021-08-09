import { Redirect } from 'react-router-dom'
import { resolveRoute } from '@pages-macro'
import { useClusterContext } from '@apps/main/[3]cluster/[-2]_clusterId/context'

export default function Index() {
  const { clusterId } = useClusterContext()
  return <Redirect to={resolveRoute('./profile', clusterId!)} />
}
