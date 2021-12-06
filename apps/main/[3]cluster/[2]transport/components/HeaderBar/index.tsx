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
