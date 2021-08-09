import { useI18n } from '@i18n-macro'

export default function () {
  const { t } = useI18n()
  return <>{t('name')}</>
}
