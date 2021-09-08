import { useHistory, useParams } from 'react-router-dom'
import { FC, useMemo } from 'react'
import { Card } from 'antd'
import type { CardTabListType } from 'antd/es/card'
import { ClusterProvider } from './context'
import { resolveRoute } from '@pages-macro'
import { useQueryClusterDetail } from '@/api/cluster'
import HeaderBar from './components/HeaderBar'
import { useI18n } from '@i18n-macro'

const Layout: FC = ({ children }) => {
  const { clusterId } = useParams<{ clusterId: string }>()
  const { data, isLoading, isError, error } = useQueryClusterDetail({
    id: clusterId,
  })

  const history = useHistory()
  const { t, i18n } = useI18n()

  const menuItems: CardTabListType[] = useMemo(
    () => [
      { key: resolveRoute('.', clusterId), tab: t('pages.profile') },
      { key: resolveRoute('perf', clusterId), tab: t('pages.perf') },
      { key: resolveRoute('monitor', clusterId), tab: t('pages.monitor') },
      { key: resolveRoute('alert', clusterId), tab: t('pages.alert') },
      { key: resolveRoute('params', clusterId), tab: t('pages.params') },
      { key: resolveRoute('backup', clusterId), tab: t('pages.backup') },
    ],
    [clusterId, i18n.language]
  )

  const currentItem = useMemo(() => {
    return menuItems.find((i) => i.key === history.location.pathname)?.key
  }, [history.location.pathname])

  return (
    <div>
      {isLoading ? (
        <>Loading</>
      ) : isError ? (
        <>{JSON.stringify(error)}</>
      ) : (
        <ClusterProvider value={data!.data.data!}>
          <HeaderBar />
          <Card
            style={{ width: '100%' }}
            tabList={menuItems}
            activeTabKey={currentItem}
            onTabChange={(key) => {
              history.push(key)
            }}
            bordered={false}
          >
            {children}
          </Card>
        </ClusterProvider>
      )}
    </div>
  )
}

export default Layout
