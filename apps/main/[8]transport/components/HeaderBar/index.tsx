import { useI18n } from '@i18n-macro'
import Header from '@/components/Header'

export default function HeaderBar() {
  const { t } = useI18n()

  return <Header title={t('header.title')} />
}
