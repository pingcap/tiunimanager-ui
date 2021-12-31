import { FC } from 'react'
import { useClusterContext } from '../context'
import ReplicationTable from './components/ReplicationTable'

const Index: FC = () => {
  const { info } = useClusterContext()

  return <ReplicationTable cluster={info!} />
}

export default Index
