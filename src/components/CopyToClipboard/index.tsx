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

import { CopyOutlined } from '@ant-design/icons'
import copyToClipboard from 'copy-to-clipboard'
import { message, Tooltip } from 'antd'
import styles from './index.module.less'
import { loadI18n, useI18n } from '@i18n-macro'

loadI18n()

export function CopyIconButton({
  text,
  label,
  float = true,
}: {
  text: string
  label: string
  float?: boolean
}) {
  const { t } = useI18n()
  const className = float
    ? `${styles.copyIcon} ${styles.float}`
    : styles.copyIcon
  return (
    <Tooltip title={t('tip', { label })}>
      <CopyOutlined
        className={className}
        onClick={() => {
          copyToClipboard(text)
          message.success(
            t('success', {
              label,
              text,
            })
          )
        }}
      />
    </Tooltip>
  )
}
