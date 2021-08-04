import { FC } from 'react'
import BackupTable from '@apps/main/[3]cluster/[-1]_clusterId/[4]backup/components/BackupTable'
import { useClusterContext } from '@apps/main/[3]cluster/[-1]_clusterId/context'

const Index: FC = () => {
  const cluster = useClusterContext()
  return <BackupTable cluster={cluster} />
}

export default Index
