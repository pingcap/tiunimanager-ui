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

import { Modal } from 'antd'
import { loadI18n, useI18n } from '@i18n-macro'
import { HostsUploader } from '@/components/HostsUploader'

loadI18n()

export interface UploadModalProps {
  visible: boolean
  close: () => void
}

export default function UploadModal({ visible, close }: UploadModalProps) {
  const { t } = useI18n()

  return (
    <Modal
      title={t('title')}
      visible={visible}
      onOk={close}
      onCancel={close}
      maskClosable={false}
      destroyOnClose={true}
      footer={null}
    >
      <HostsUploader onFinish={(success) => success && close()} />
    </Modal>
  )
}
