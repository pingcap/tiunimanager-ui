import { ExternalService } from '@/components/ExternalService'
import { useClusterContext } from '@apps/main/[3]cluster/[1]instances/[-2]_clusterId/context'
import { useQueryClusterExternalService } from '@/api/hooks/cluster'

export default function () {
  const { clusterId } = useClusterContext()
  const { data } = useQueryClusterExternalService({ id: clusterId! })
  const alertUrl = data?.data.data?.alertUrl || ''
  return <ExternalService src={alertUrl} mode="card" />
}
