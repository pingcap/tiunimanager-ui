import { Redirect } from 'react-router-dom'
import { resolveRoute } from '@pages-macro'
import { useHistoryWithState } from '@/router/helper'
import { ClusterInfo } from '@/api/model'
import HeaderBar from './components/HeaderBar'
import ClonePanel from './components/ClonePanel'

export default function () {
  const history = useHistoryWithState<{
    cluster: ClusterInfo
    from: string
  }>()
  const { cluster, from } = history.location.state

  if (!cluster) {
    return <Redirect to={resolveRoute('../')} />
  }

  const backPath = from || resolveRoute('../')
  const backToPrevPage = () => history.push(backPath)

  return (
    <>
      <HeaderBar back={backToPrevPage} />
      <ClonePanel back={backToPrevPage} cluster={cluster} />
    </>
  )
}
