import { FC } from 'react'
import { LogsTable } from './components/LogsTable'
import { useClusterContext } from '@apps/main/[3]cluster/[-2]_clusterId/context'

const Index: FC = () => {
  const cluster = useClusterContext()
  return <LogsTable cluster={cluster} />
}

export default Index
