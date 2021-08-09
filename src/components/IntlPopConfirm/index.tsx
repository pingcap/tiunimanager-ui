import { Popconfirm } from 'antd'
import { loadI18n, useI18n } from '@i18n-macro'
import { PopconfirmProps } from 'antd/lib/popconfirm'
loadI18n()

export default function IntlPopConfirm(props: PopconfirmProps) {
  const { t } = useI18n()
  return <Popconfirm okText={t('ok')} cancelText={t('cancel')} {...props} />
}
