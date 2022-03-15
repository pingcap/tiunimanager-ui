import { FC, ReactNode, useState } from 'react'
import { Layout } from 'antd'
import SideMenu from '@apps/main/layouts/SideMenu'
import { IMenuItem } from '@pages-macro'
import { IPageMeta } from '@/model/page'
import styles from './index.module.less'

export interface MainLayoutProps {
  logo?: ReactNode

  menuItems: IMenuItem<IPageMeta>[]
  siderDisabled?: boolean
}

const COLLAPSED_WIDTH = 80
const EXPANDED_WIDTH = 240

const MainLayout: FC<MainLayoutProps> = (props) => {
  const {
    children,
    // logo,
    menuItems,
    siderDisabled = false,
  } = props || {}

  const [marginWidth, setMarginWidth] = useState(EXPANDED_WIDTH)

  if (siderDisabled) {
    return <Layout className={styles.blankLayout}>{children}</Layout>
  }

  return (
    <Layout>
      <SideMenu
        width={EXPANDED_WIDTH}
        collapsedWidth={COLLAPSED_WIDTH}
        onCollapsedChange={(collapsed) => {
          setMarginWidth(collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH)
        }}
        items={menuItems}
      />
      <Layout style={{ marginLeft: marginWidth }} className={styles.pageLayout}>
        <Layout.Content className={styles.content}>{children}</Layout.Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
