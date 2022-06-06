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
