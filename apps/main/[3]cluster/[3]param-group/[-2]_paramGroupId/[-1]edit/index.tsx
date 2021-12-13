import { useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import { resolveRoute } from '@pages-macro'
import EditingPanel from './components/EditingPanel'
import HeaderBar from './components/HeaderBar'

export default function () {
  const history = useHistory()

  const back = useCallback(
    () => history.push(resolveRoute('../../')),
    [history]
  )

  return (
    <>
      <HeaderBar back={back} />
      <EditingPanel back={back} />
    </>
  )
}
