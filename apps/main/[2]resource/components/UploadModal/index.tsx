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
