import { useI18n } from '@i18n-macro'
import { Button } from 'antd'
import { ApiOutlined, PlusOutlined } from '@ant-design/icons'
import { useHistory } from 'react-router-dom'
import { resolveRoute } from '@pages-macro'
import Header from '@/components/Header'
import { TakeoverModal } from '@apps/main/[3]cluster/components/TakeoverModal'
import { useState } from 'react'

export default function HeaderBar() {
  const { t } = useI18n()
  const history = useHistory()
  const [takeoverVisible, setTakeoverVisible] = useState(false)
  return (
    <>
      <Header
        title={t('header.title')}
        extra={[
          <Button key="takeover" onClick={() => setTakeoverVisible(true)}>
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
      <TakeoverModal
        visible={takeoverVisible}
        close={() => setTakeoverVisible(false)}
      />
    </>
  )
}
