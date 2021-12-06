import HeaderBar from './components/HeaderBar'
import { ImportPanel } from '@apps/main/[3]cluster/[2]transport/components/TransportPanel'
import { useHistory } from 'react-router-dom'
import { resolveRoute } from '@pages-macro'

export default function () {
  const history = useHistory()
  const back = () => history.push(resolveRoute('../'))
  return (
    <>
      <HeaderBar back={back} />
      <ImportPanel back={back} />
    </>
  )
}
