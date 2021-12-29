import { Collapse, notification } from 'antd'
import { getI18n, loadI18n } from '@i18n-macro'
import { AxiosError } from 'axios'
import styles from './index.module.less'

loadI18n()

export function useErrorNotification(error: AxiosError) {
  // Note: Notifications do not require response language switching, so use getI18n instead of useI18n
  const t = getI18n()
  notification.open({
    message: t('error.title'),
    icon: null,
    duration: 0, // TODO: How long?
    description: <ErrorNotification error={error} />,
    className: styles.notification,
  })
}

export function ErrorNotification({ error }: { error: AxiosError }) {
  const code: number = error.response?.data.code || -1
  const { method, url } = error.config
  const t = getI18n()
  return (
    <div className={styles.body}>
      <div>{t(`error:${code}`, 'unknown')}</div>
      <Collapse
        defaultActiveKey={[]}
        ghost
        className={styles.body}
        style={{
          marginLeft: -16,
        }}
      >
        <Collapse.Panel header={t('error.more')} key={1}>
          <div className={styles.item}>
            <div>{t('error.method')}</div>
            <div>{method?.toUpperCase() || 'unknown'}</div>
          </div>
          <div className={styles.item}>
            <div>{t('error.url')}</div>
            <div>{url}</div>
          </div>
          <div className={styles.item}>
            <div>{t('error.code')}</div>
            <div>{code}</div>
          </div>
          <div className={styles.item}>
            <div>{t('error.stack')}</div>
            <div>{error.stack}</div>
          </div>
        </Collapse.Panel>
      </Collapse>
    </div>
  )
}
