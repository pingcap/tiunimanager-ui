import { FC } from 'react'
import { ParamsTable } from './components/ParamsTable'
import { useClusterContext } from '@apps/main/[3]cluster/[1]instances/[-2]_clusterId/context'

const Index: FC = () => {
  const { info } = useClusterContext()

  return <ParamsTable cluster={info!} />
}

export default Index
