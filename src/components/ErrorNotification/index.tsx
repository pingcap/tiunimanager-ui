/*
 * Copyright 2022 PingCAP, Inc.
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

import { Collapse, notification, Typography } from 'antd'
import { getI18n, loadI18n } from '@i18n-macro'
import { AxiosError } from 'axios'
import styles from './index.module.less'

loadI18n()

export function useErrorNotification(error: AxiosError) {
  // Note: Notifications do not require response language switching, so use getI18n instead of useI18n
  const t = getI18n()
  const key = error.config.requestId
    ? `request-id-${error.config.requestId}`
    : `${Date.now()}`
  notification.open({
    key,
    message: error.config.errorMessage
      ? error.config.errorMessage
      : t('error.defaultTitle'),
    icon: null,
    duration: 5,
    description: <ErrorNotification error={error} />,
    className: styles.notification,
  })
}

export function ErrorNotification({ error }: { error: AxiosError }) {
  const code: number = error.response?.data.code || -1
  const traceId: string | undefined = error.response?.headers['em-x-trace-id']
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
          {traceId && (
            <div className={styles.item}>
              <div>{t('error.traceId')}</div>
              <div>{traceId}</div>
            </div>
          )}
          {error.config.method !== 'get' && (
            <div className={styles.item}>
              <div>{t('error.request')}</div>
              <Typography.Paragraph
                ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
              >
                {JSON.stringify(error.request)}
              </Typography.Paragraph>
            </div>
          )}
          {error.response?.data.message && (
            <div className={styles.item}>
              <div>{t('error.message')}</div>
              <Typography.Paragraph
                ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
              >
                {error.response?.data.message}
              </Typography.Paragraph>
            </div>
          )}
        </Collapse.Panel>
      </Collapse>
    </div>
  )
}
