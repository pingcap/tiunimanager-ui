import { loadI18n, useI18n } from '@i18n-macro'
import Header from '@/components/Header'

loadI18n()

type HeaderBarProps = {
  back: () => unknown
}

export default function HeaderBar({ back }: HeaderBarProps) {
  const { t } = useI18n()
  return <Header title={t('title')} onBack={back} />
}
