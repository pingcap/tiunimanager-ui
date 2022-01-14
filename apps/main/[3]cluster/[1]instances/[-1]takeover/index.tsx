import { useHistory } from 'react-router-dom'
import { useCallback } from 'react'
import { resolveRoute } from '@pages-macro'
import HeaderBar from './components/HeaderBar'
import { TakeoverPanel } from './components/TakeoverPanel'

export default function () {
  const history = useHistory()

  const back = useCallback(() => history.push(resolveRoute('../')), [history])

  return (
    <>
      <HeaderBar back={back} />
      <TakeoverPanel back={back} />
    </>
  )
}
