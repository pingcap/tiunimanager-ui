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
      <UploadModal visible={uploaderVisible} close={toggleUploaderVisible} />
    </>
  )
}
