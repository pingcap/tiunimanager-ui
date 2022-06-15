/*
 * Copyright 2022 PingCAP
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
    duration: 4,
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
