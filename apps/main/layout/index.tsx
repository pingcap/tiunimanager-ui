import { CSSProperties, FC, ReactNode } from 'react'
import { Layout } from 'antd'
import SideMenu from '@apps/main/layout/SideMenu'
import { IMenuItem } from '@import-pages-macro'
import { IPageMeta } from '@/model/page'

export interface MainLayoutProps {
  logo?: ReactNode

  className?: string
  style?: CSSProperties
  contentClassName?: string
  contentStyle?: CSSProperties
  sideMenuClassName?: string
  sideMenuStyle?: CSSProperties

  menuItems: IMenuItem<IPageMeta>[]
}

const MainLayout: FC<MainLayoutProps> = (props) => {
  const {
    children,
    // logo,
    className,
    contentClassName,
    sideMenuClassName,
    style,
    contentStyle,
    sideMenuStyle,
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

  return (
    <Layout
      className={className}
      style={{
        minHeight: '100vh',
        ...style,
      }}
    >
      <SideMenu
        width={240}
        className={sideMenuClassName}
        style={sideMenuStyle}
        items={menuItems}
      />
      <Layout>
        {/* XXX: Should we add page header? */}
        <Layout.Content className={contentClassName} style={contentStyle}>
          {children}
        </Layout.Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
