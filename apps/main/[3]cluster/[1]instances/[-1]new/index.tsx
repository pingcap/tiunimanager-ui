import { CreatePanel } from '@apps/main/[3]cluster/[1]instances/[-1]new/components/CreatePanel'
import HeaderBar from './components/HeaderBar'
import { resolveRoute } from '@pages-macro'
import { useCallback } from 'react'
import { useHistory } from 'react-router-dom'

export default function () {
  const history = useHistory()

  const back = useCallback(() => history.push(resolveRoute('../')), [history])

  return (
    <>
      <HeaderBar back={back} />
      <CreatePanel back={back} />
    </>
  )
}
