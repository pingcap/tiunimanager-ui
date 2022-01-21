import { Popconfirm, PopconfirmProps } from 'antd'
import { loadI18n, useI18n } from '@i18n-macro'
import styles from './index.module.less'

loadI18n()

export default function IntlPopConfirm(props: PopconfirmProps) {
  const { t } = useI18n()

  return (
    <Popconfirm
      overlayClassName={styles.intlPopConfirm}
      okText={t('ok')}
      cancelText={t('cancel')}
      okButtonProps={{ size: 'middle' }}
      cancelButtonProps={{ size: 'middle' }}
      {...props}
    />
  )
}
