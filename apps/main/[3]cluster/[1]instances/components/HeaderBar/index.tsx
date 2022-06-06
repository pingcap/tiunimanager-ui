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

import { useI18n } from '@i18n-macro'
import { Button } from 'antd'
import { ApiOutlined, PlusOutlined } from '@ant-design/icons'
import { useHistory } from 'react-router-dom'
import { resolveRoute } from '@pages-macro'
import Header from '@/components/Header'

export default function HeaderBar() {
  const { t } = useI18n()
  const history = useHistory()

  return (
    <Header
      title={t('header.title')}
      extra={[
        <Button
          key="takeover"
          onClick={() => history.push(resolveRoute('takeover'))}
        >
          <ApiOutlined /> {t('header.takeover')}
        </Button>,
        <Button
          type="primary"
          key="create"
          onClick={() => history.push(resolveRoute('new'))}
        >
          <PlusOutlined /> {t('header.new')}
        </Button>,
      ]}
    />
  )
}
