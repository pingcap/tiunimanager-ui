import { CreatePanel } from '@apps/main/[3]cluster/[-1]new/components/CreatePanel'
import HeaderBar from './components/HeaderBar'
import { useHistoryWithState } from '@/router/helper'
import { resolveRoute } from '@pages-macro'
import { useCallback } from 'react'

export default function () {
  const history = useHistoryWithState({ from: resolveRoute('../') })

  const back = useCallback(
    () => history.push(history.location.state.from),
    [history]
  )

  return (
    <>
      <HeaderBar back={back} />
      <CreatePanel back={back} />
    </>
  )
}
