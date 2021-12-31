import { useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import { resolveRoute } from '@pages-macro'
import { useI18n } from '@i18n-macro'
import Header from '@/components/Header'

export default function HeaderBar() {
  const history = useHistory()

  const back = useCallback(() => history.push(resolveRoute('../')), [history])

  const { t } = useI18n()

  return <Header onBack={back} title={t('header.title')} />
}
