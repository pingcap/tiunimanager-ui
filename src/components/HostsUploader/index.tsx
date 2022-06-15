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

import { Button, message, Upload, UploadProps } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import { useDownload } from '@hooks/useDownload'
import { getHostsTemplateURL, getHostsUploadURL } from '@/api/hooks/resources'
import { useAuthState } from '@store/auth'
import { loadI18n, useI18n } from '@i18n-macro'

loadI18n()

const UploadURL = getHostsUploadURL()
const DownloadURL = getHostsTemplateURL()

const MaxBytes = 2 * 1024 * 1024 * 1024 // in bytes

export interface HostsUploaderProps {
  reserved?: boolean
  onFinish?: (success: boolean) => unknown
  uploadProps?: UploadProps
}

export function HostsUploader({
  onFinish,
  uploadProps,
  reserved = false,
}: HostsUploaderProps) {
  const { t } = useI18n()
  const token = useAuthState((state) => state.token)

  const checkFileFormat: UploadProps['beforeUpload'] = (file) => {
    // see https://www.iana.org/assignments/media-types/media-types.xhtml
    if (
      file.type !== 'application/vnd.ms-excel' &&
      file.type !==
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      message.error(t('error.format'))
      return Upload.LIST_IGNORE
    }

    if (file.size > MaxBytes) {
      message.error(t('error.size'))
      return Upload.LIST_IGNORE
    }

    return true
  }

  return (
    <div>
      <Upload.Dragger
        name="file"
        action={UploadURL}
        headers={{
          Authorization: `Bearer ${token}`,
        }}
        beforeUpload={checkFileFormat}
        data={{
          hostReserved: reserved,
          // TODO: remove hard-coded skipHostInit and ignorewarns
          skipHostInit: false,
          ignorewarns: false,
        }}
        maxCount={1}
        accept={
          'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
        onChange={(info) => {
          switch (info.file.status) {
            case 'done':
              message.success(t('status.success'), 2)
              onFinish?.(true)
              return
            case 'error':
              message.error(
                t('status.fail', {
                  msg: info.file.response.message || 'unknown',
                })
              )
              onFinish?.(false)
              return
          }
        }}
        {...uploadProps}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">{t('hint.upload')}</p>
        <p className="ant-upload-hint">{t('hint.format')}</p>
      </Upload.Dragger>
      <div
        style={{
          textAlign: 'right',
          marginTop: 20,
        }}
      >
        <Button
          type="link"
          onClick={() => useDownload(DownloadURL, 'template.xlsx')}
        >
          {t('hint.download')}
        </Button>
      </div>
    </div>
  )
}
