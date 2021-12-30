import { useCallback } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { resolveRoute } from '@pages-macro'
import { useClusterContext } from '../../../context'
import HeaderBar from './components/HeaderBar'
import EditingPanel from './components/EditingPanel'

export default function () {
  const history = useHistory()

  const { info } = useClusterContext()

  const back = useCallback(
    () => history.push(resolveRoute('../../', info!.clusterId!)),
    [history]
  )

  const { replicationId } = useParams<{ replicationId: string }>()

  return (
    <>
      <HeaderBar back={back} />
      <EditingPanel back={back} taskId={replicationId} />
    </>
  )
}
