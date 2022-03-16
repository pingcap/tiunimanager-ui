import { Redirect } from 'react-router-dom'
import { resolveRoute } from '@pages-macro'

export default function () {
  return <Redirect to={resolveRoute('../../start')} />
}
