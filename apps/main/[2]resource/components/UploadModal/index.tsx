import { InboxOutlined } from '@ant-design/icons'
import { Button, message, Modal, Upload, UploadProps } from 'antd'
import { useAuthState } from '@store/auth'
import { getHostsTemplateURL, getHostsUploadURL } from '@/api/resources'
import { loadI18n, useI18n } from '@i18n-macro'
import { useMemo } from 'react'
import { useDownload } from '@hooks/useDownload'

loadI18n()

export interface UploadModalProps {
  visible: boolean
  close: () => void
}

const UploadURL = getHostsUploadURL()
const DownloadURL = getHostsTemplateURL()

export default function UploadModal({ visible, close }: UploadModalProps) {
  const token = useAuthState((state) => state.token)
  const { t, i18n } = useI18n()

  const dom = useMemo(() => {
    const checkFileFormat: UploadProps['beforeUpload'] = (file) => {
      // see https://www.iana.org/assignments/media-types/media-types.xhtml
      if (
        file.type === 'application/vnd.ms-excel' ||
        file.type ===
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      )
        return true

      message.error(t('error.format'))
      return Upload.LIST_IGNORE
    }
    return (
      <>
        <Upload.Dragger
          name="file"
          action={UploadURL}
          headers={{
            Authorization: `Bearer ${token}`,
          }}
          beforeUpload={checkFileFormat}
          maxCount={1}
          onChange={(info) => {
            switch (info.file.status) {
              case 'uploading':
                message.info(t('status.uploading'), 1)
                return
              case 'done':
                message.success(t('status.success'), 2)
                close()
                return
              case 'error':
                message.error(
                  t('status.fail', {
                    msg: info.file.response.message || 'unknown',
                  })
                )
                return
            }
          }}
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
      </>
    )
  }, [i18n.language])

  return (
    <Modal
      title={t('title')}
      visible={visible}
      onOk={() => close()}
      onCancel={() => close()}
      maskClosable={false}
      destroyOnClose={true}
      footer={null}
    >
      {dom}
    </Modal>
  )
}
