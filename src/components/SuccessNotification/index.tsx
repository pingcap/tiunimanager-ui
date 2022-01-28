import { notification } from 'antd'
import { getI18n, loadI18n } from '@i18n-macro'
import { AxiosResponse } from 'axios'
import styles from './index.module.less'
import { history } from '@/router/helper'

loadI18n()

export function useSuccessNotification(resp: AxiosResponse) {
  // Note: Notifications do not require response language switching, so use getI18n instead of useI18n
  const t = getI18n()

  const workflowId = resp.data.data?.workFlowId
  const message = resp.config.successMessage
    ? resp.config.successMessage
    : t('success.defaultTitle')
  const key = `success_${Date.now()}`
  notification.open({
    message: message,
    icon: null,
    duration: 5,
    key,
    description: workflowId && (
      <SuccessNotification workflowId={workflowId} notificationKey={key} />
    ),
    className: styles.notification,
  })
}

export function SuccessNotification({
  workflowId,
  notificationKey,
}: {
  workflowId: string
  notificationKey: string
}) {
  const t = getI18n()
  return (
    <div className={styles.body}>
      <div>
        <div className={styles.item}>
          <div>{t('success.workflowId')}</div>
          <div>{workflowId}</div>
        </div>
      </div>
      <div>
        <a
          className="ant-btn-link"
          onClick={() => {
            history.push({
              pathname: '/task', // FIXME: pass workflow id
            })
            notification.close(notificationKey)
          }}
        >
          {t('success.toDetail')}
        </a>
      </div>
    </div>
  )
}
