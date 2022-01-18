import { FC } from 'react'
import { Button } from 'antd'
import IntlPopConfirm from '@/components/IntlPopConfirm'
import { loadI18n, useI18n } from '@i18n-macro'

import styles from './index.module.less'

loadI18n()

interface FooterProps {
  disabled?: boolean
  loading?: boolean
  onSubmit: () => void
  onReset: () => void
}

const Footer: FC<FooterProps> = ({
  disabled = false,
  loading = false,
  onSubmit,
  onReset,
}) => {
  const { t } = useI18n()

  return (
    <div className={styles.footer}>
      <IntlPopConfirm title={t('footer.reset.confirm')} onConfirm={onReset}>
        <Button size="large">{t('footer.reset.title')}</Button>
      </IntlPopConfirm>
      <Button
        className={styles.confirm}
        size="large"
        type="primary"
        loading={loading}
        disabled={disabled}
        onClick={onSubmit}
      >
        {t('footer.submit.title')}
      </Button>
    </div>
  )
}

export default Footer
