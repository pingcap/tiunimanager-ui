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
import { PlusOutlined } from '@ant-design/icons'
import useToggle from '@hooks/useToggle'
import UploadModal from '@apps/main/[2]resource/components/UploadModal'
import Header from '@/components/Header'

export default function HeaderBar() {
  const { t } = useI18n()
  const [uploaderVisible, toggleUploaderVisible] = useToggle(false)

  return (
    <>
      <Header
        title={t('header.title')}
        extra={
          <Button
            type="primary"
            key="import"
            onClick={() => toggleUploaderVisible()}
          >
            <PlusOutlined /> {t('header.import')}
          </Button>
        }
      />
      <UploadModal
        visible={uploaderVisible}
        close={() => toggleUploaderVisible()}
      />
    </>
  )
}
