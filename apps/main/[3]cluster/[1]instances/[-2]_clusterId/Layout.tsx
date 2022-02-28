import { Redirect, useHistory, useParams } from 'react-router-dom'
import { FC, useMemo } from 'react'
import { Card } from 'antd'
import type { CardTabListType } from 'antd/es/card'
import { ClusterProvider } from './context'
import { resolveRoute } from '@pages-macro'
import { useQueryClusterDetail } from '@/api/hooks/cluster'
import HeaderBar from './components/HeaderBar'
import { useI18n } from '@i18n-macro'
import { trimTrailingSlash } from '@/utils/path'

const Layout: FC = ({ children }) => {
  const { clusterId } = useParams<{ clusterId: string }>()
  const { data, isLoading, isError, error } = useQueryClusterDetail(
    {
      id: clusterId,
    },
    {
      refetchOnWindowFocus: false,
    }
  )

  const history = useHistory()
  const { t, i18n } = useI18n()

  const menuItems: CardTabListType[] = useMemo(
    () => [
      { key: resolveRoute('profile', clusterId), tab: t('pages.profile') },
      { key: resolveRoute('perf', clusterId), tab: t('pages.perf') },
      { key: resolveRoute('logs', clusterId), tab: t('pages.logs') },
      { key: resolveRoute('monitor', clusterId), tab: t('pages.monitor') },
      { key: resolveRoute('alert', clusterId), tab: t('pages.alert') },
      { key: resolveRoute('params', clusterId), tab: t('pages.params') },
      { key: resolveRoute('backup', clusterId), tab: t('pages.backup') },
      {
        key: resolveRoute('replication', clusterId),
        tab: t('pages.replication'),
      },
    ],
    [clusterId, i18n.language]
  )

  const currentTab = useMemo(() => {
    const currentPath = trimTrailingSlash(history.location.pathname)
    return menuItems.find((i) => i.key === currentPath)?.key
  }, [history.location.pathname])

  return (
    <div>
      {isLoading ? (
        <>Loading</>
      ) : isError ? (
        <>{JSON.stringify(error)}</>
      ) : !data!.data.data?.info?.clusterId ? (
        <Redirect to={resolveRoute('..')} />
      ) : (
        <ClusterProvider value={data!.data.data!}>
          {currentTab ? (
            <>
              <HeaderBar />
              <Card
                style={{ width: '100%' }}
                tabList={menuItems}
                activeTabKey={currentTab}
                onTabChange={(key) => {
                  history.push(key)
                }}
                bordered={false}
              >
                {children}
              </Card>
            </>
          ) : (
            children
          )}
        </ClusterProvider>
      )}
    </div>
  )
}

export default Layout
