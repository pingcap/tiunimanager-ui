import { useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import { resolveRoute } from '@pages-macro'
import HeaderBar from './components/HeaderBar'
import CreationPanel from './components/CreationPanel'

export default function () {
  const history = useHistory()

  const back = useCallback(() => history.push(resolveRoute('../')), [history])

  return (
    <>
      <HeaderBar back={back} />
      <CreationPanel back={back} />
    </>
  )
}
