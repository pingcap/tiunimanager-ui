import { useI18n } from '@i18n-macro'
import Header from '@/components/Header'

interface HeaderBarProps {
  back: () => void
}

export default function HeaderBar({ back }: HeaderBarProps) {
  const { t } = useI18n()

  return <Header onBack={back} title={t('header.title')} />
}
