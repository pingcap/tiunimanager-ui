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
  const message = resp.config.actionName
    ? workflowId
      ? t('success.workflowTitle', { name: resp.config.actionName })
      : t('success.title', { name: resp.config.actionName })
    : t('success.defaultTitle')
  notification.open({
    message: message,
    icon: null,
    duration: 5,
    key: workflowId,
    description: workflowId && <SuccessNotification workflowId={workflowId} />,
    className: styles.notification,
  })
}

export function SuccessNotification({ workflowId }: { workflowId: string }) {
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
            notification.close(workflowId)
          }}
        >
          {t('success.toDetail')}
        </a>
      </div>
    </div>
  )
}
