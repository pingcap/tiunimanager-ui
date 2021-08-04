import { FC, ReactNode, useState } from 'react'
import { Layout } from 'antd'
import SideMenu from '@apps/main/layouts/SideMenu'
import { IMenuItem } from '@import-pages-macro'
import { IPageMeta } from '@/model/page'

export interface MainLayoutProps {
  logo?: ReactNode

  menuItems: IMenuItem<IPageMeta>[]
}

const COLLAPSED_WIDTH = 80
const EXPANDED_WIDTH = 240

const MainLayout: FC<MainLayoutProps> = (props) => {
  const {
    children,
    // logo,
    menuItems,
  } = props || {}

  // TODO: Keep it.
  // useEffect(() => {
  // 稍微慢一点 render，不然会造成性能问题，看起来像是菜单的卡顿
  // const animationFrameId = requestAnimationFrame(() => {
  //   setMenuInfoData(infoData)
  // })
  // return () =>
  //   window.cancelAnimationFrame &&
  //   window.cancelAnimationFrame(animationFrameId)
  // }, [])

  // TODO: Calculate className according to [prop.className, collapsed?]

  // TODO: Calculate SideMenu width

  const [marginWidth, setMarginWidth] = useState(EXPANDED_WIDTH)

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
      <Layout style={{ marginLeft: marginWidth, transition: 'margin 0.2s' }}>
        {/* XXX: Should add page header? */}
        <Layout.Content
          style={{
            padding: 36,
            minHeight: '100vh',
          }}
        >
          {children}
        </Layout.Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
