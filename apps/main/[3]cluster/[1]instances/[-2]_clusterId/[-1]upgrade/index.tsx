import { useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import { resolveRoute } from '@pages-macro'
import { useClusterContext } from '../context'
import HeaderBar from './components/HeaderBar'
import UpgradePanel from './components/UpgradePanel'

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
      <UpgradePanel back={back} cluster={info!} />
    </>
  )
}
