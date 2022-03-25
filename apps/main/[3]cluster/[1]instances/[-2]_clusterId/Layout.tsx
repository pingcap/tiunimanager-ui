import { FC, useMemo } from 'react'
import { Redirect, useHistory, useParams } from 'react-router-dom'
import { Card } from 'antd'
import type { CardTabListType } from 'antd/es/card'
import { useI18n } from '@i18n-macro'
import { resolveRoute } from '@pages-macro'
import { trimTrailingSlash } from '@/utils/path'
import { useQueryClusterDetail } from '@/api/hooks/cluster'
import { ClusterStatus } from '@/api/model'
import HeaderBar from './components/HeaderBar'
import { ClusterProvider } from './context'

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
  const clusterDetailData = data?.data.data || {}

  const history = useHistory()
  const { t, i18n } = useI18n()

  const menuItems: CardTabListType[] = useMemo(() => {
    const disabled = clusterDetailData.info?.status !== ClusterStatus.running

    return [
      { key: resolveRoute('profile', clusterId), tab: t('pages.profile') },
      { key: resolveRoute('perf', clusterId), tab: t('pages.perf'), disabled },
      { key: resolveRoute('logs', clusterId), tab: t('pages.logs'), disabled },
      {
        key: resolveRoute('monitor', clusterId),
        tab: t('pages.monitor'),
        disabled,
      },
      {
        key: resolveRoute('alert', clusterId),
        tab: t('pages.alert'),
        disabled,
      },
      {
        key: resolveRoute('params', clusterId),
        tab: t('pages.params'),
        disabled,
      },
      {
        key: resolveRoute('backup', clusterId),
        tab: t('pages.backup'),
        disabled,
      },
      {
        key: resolveRoute('replication', clusterId),
        tab: t('pages.replication'),
        disabled,
      },
    ]
  }, [i18n.language, clusterId, clusterDetailData.info?.status])

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
      ) : !clusterDetailData.info?.clusterId ? (
        <Redirect to={resolveRoute('..')} />
      ) : (
        <ClusterProvider value={clusterDetailData}>
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
