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
