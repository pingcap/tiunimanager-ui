import { FC } from 'react'
import { LogsTable } from './components/LogsTable'
import { useClusterContext } from '@apps/main/[3]cluster/[1]instances/[-2]_clusterId/context'

const Index: FC = () => {
  const { info } = useClusterContext()
  return <LogsTable cluster={info!} />
}

export default Index
