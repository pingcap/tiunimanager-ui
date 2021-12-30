import { useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import { resolveRoute } from '@pages-macro'
import HeaderBar from './components/HeaderBar'
import { useClusterContext } from '../../context'
import CreationPanel from './components/CreationPanel'

export default function () {
  const history = useHistory()

  const { info } = useClusterContext()

  const back = useCallback(
    () => history.push(resolveRoute('../', info!.clusterId!)),
    [history]
  )

  return (
    <>
      <HeaderBar back={back} />
      <CreationPanel clusterId={info!.clusterId!} back={back} />
    </>
  )
}
