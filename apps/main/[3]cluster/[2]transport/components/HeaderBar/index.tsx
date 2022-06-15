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

import { loadI18n, useI18n } from '@i18n-macro'
import Header from '@/components/Header'
import { Button } from 'antd'
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons'
import { useHistory } from 'react-router-dom'
import { resolveRoute } from '@pages-macro'

loadI18n()

export default function HeaderBar() {
  const { t } = useI18n()
  const history = useHistory()

  const actions = [
    <Button key="import" onClick={() => history.push(resolveRoute('./import'))}>
      <UploadOutlined />
      {t('actions.import')}
    </Button>,
    <Button key="export" onClick={() => history.push(resolveRoute('./export'))}>
      <DownloadOutlined />
      {t('actions.export')}
    </Button>,
  ]

  return <Header title={t('title')} extra={actions} />
}
