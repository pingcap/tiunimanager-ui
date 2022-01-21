import { FC } from 'react'
import { Empty } from 'antd'
import { useI18n } from '@i18n-macro'
import { useClusterContext } from '../context'
import ReplicationTable from './components/ReplicationTable'

const Index: FC = () => {
  const { info, topology } = useClusterContext()

  const disabled = !topology?.find((item) => item.type === 'CDC')
  const { t } = useI18n()

  if (disabled) {
    return <Empty description={t('disabled.desc')} />
  }

  return <ReplicationTable cluster={info!} />
}

export default Index
