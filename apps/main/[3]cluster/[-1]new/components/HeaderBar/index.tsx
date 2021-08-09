import { useI18n } from '@i18n-macro'
import { useHistory } from 'react-router-dom'
import { resolveRoute } from '@pages-macro'
import Header from '@/components/Header'

export default function HeaderBar() {
  const { t } = useI18n()
  const history = useHistory()
  const backToList = () => history.push(resolveRoute('../'))
  return <Header onBack={backToList} title={t('header.title')} />
}
