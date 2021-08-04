import { FC } from 'react'
import { ParamsTable } from '@apps/main/[3]cluster/[-1]_clusterId/[3]params/components/ParamsTable'
import { useClusterContext } from '@apps/main/[3]cluster/[-1]_clusterId/context'

const Index: FC = () => {
  const cluster = useClusterContext()
  return <ParamsTable cluster={cluster} />
}

export default Index
