import { useI18n } from '@i18n-macro'
import { Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useHistory } from 'react-router-dom'
import { resolveRoute } from '@pages-macro'
import Header from '@/components/Header'

export default function HeaderBar() {
  const { t } = useI18n()
  const history = useHistory()

  return (
    <Header
      title={t('header.title')}
      extra={
        <Button
          type="primary"
          key="create"
          onClick={() => history.push(resolveRoute('new'))}
        >
          <PlusOutlined /> {t('header.new')}
        </Button>
      }
    />
  )
}
