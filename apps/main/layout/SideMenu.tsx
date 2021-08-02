import { FC } from 'react'
import { Dropdown, Layout, Menu, MenuProps } from 'antd'
import { matchPath, useHistory, useLocation } from 'react-router-dom'
import styles from './SideMenu.module.less'
import {
  GlobalOutlined,
  LeftOutlined,
  LogoutOutlined,
  RightOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons'
import LanguageDropdown from '@/components/LanguageDropdown'
import { APIS } from '@/api/client'
import { IPageMeta } from '@/model/page'
import { IMenuItem } from '@import-pages-macro'
import { useTranslation } from 'react-i18next'
import useToggle from '@hooks/useToggle'
import { dispatchAuthState, useAuthState } from '@store/auth'

export interface SideMenuProps extends MenuProps {
  className?: string
  items: IMenuItem<IPageMeta>[]
  defaultCollapsed?: boolean
  collapsedWidth?: number
  onCollapsedChange?: (collapsed: boolean) => void
  width?: number
}

function getMatchedMenuItemKeys(items: IMenuItem<IPageMeta>[], path: string) {
  const matched: string[] = []
  let temp = items
  while (temp.length) {
    const buf = []
    for (const item of temp) {
      if (matchPath(path, item.path)) {
        matched.push(item.id)
        buf.push(...item.children)
      }
      temp = buf
    }
  }
  return matched
}

const SideMenu: FC<SideMenuProps> = ({
  defaultCollapsed,
  collapsedWidth,
  onCollapsedChange,
  className = '',
  items,
  width,
  ...rest
}) => {
  const [collapsed, toggleCollapsed] = useToggle(defaultCollapsed ?? false)

  // TODO: Calculate matched item and opened items
  const matchedKeys = getMatchedMenuItemKeys(items, useLocation().pathname)

  // no need to be memoized
  const selectedKey = matchedKeys[matchedKeys.length - 1]

  const { t } = useTranslation()

  const getItemName = (item: IMenuItem<IPageMeta>) =>
    t(`${item.id}:name`, item.defaultName)

  const history = useHistory()

  function renderMenu(items: IMenuItem<IPageMeta>[]) {
    return items.map((item) => {
      if (item.children.length) {
        return (
          <Menu.SubMenu
            key={item.id}
            icon={item.meta.icon}
            title={getItemName(item)}
          >
            {renderMenu(item.children)}
          </Menu.SubMenu>
        )
      } else {
        return (
          <Menu.Item
            key={item.id}
            icon={item.meta.icon}
            title={getItemName(item)}
            onClick={() =>
              history.location.pathname !== item.path && history.push(item.path)
            }
          >
            {getItemName(item)}
          </Menu.Item>
        )
      }
    })
  }

  const CollapseIcon = collapsed ? RightOutlined : LeftOutlined

  // const menuItems = <Menu.Item></Menu.Item>
  return (
    <Layout.Sider
      // TODO: Use custom collapsed trigger.
      // trigger={null}
      className={className}
      width={width}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 999,
        height: '100vh',
      }}
      collapsedWidth={collapsedWidth}
      theme="light"
      collapsible
      collapsed={collapsed}
      trigger={null}
    >
      {/* TODO: Logo */}
      <div className={styles.logo} />
      {/* TODO: Add collapse button */}
      <Menu
        theme="light"
        mode="inline"
        className={styles.menu}
        {...rest}
        selectedKeys={[selectedKey]}
        defaultOpenKeys={matchedKeys}
      >
        {renderMenu(items)}
      </Menu>
      <div
        className={styles.actions}
        style={{
          height: collapsed ? 150 : 48,
          flexDirection: collapsed ? 'column' : 'row',
        }}
      >
        <UserAction />
        <LanguageDropdown placement="topCenter">
          <GlobalOutlined />
        </LanguageDropdown>
        <SettingOutlined />
        <CollapseIcon
          onClick={() => {
            onCollapsedChange?.(!collapsed)
            toggleCollapsed()
          }}
          style={{
            fontSize: collapsed ? 24 : 18,
          }}
        />
      </div>
    </Layout.Sider>
  )
}

export default SideMenu

function UserAction() {
  const [{ token }] = useAuthState()
  const userAction = (
    <Menu>
      <Menu.Item
        key="logout"
        title="logout"
        onClick={() => {
          APIS.Platform.userLogoutPost(token, {})
          dispatchAuthState({
            type: 'logout',
          })
        }}
      >
        {/* TODO: logout & i18n */}
        <LogoutOutlined /> logout
      </Menu.Item>
    </Menu>
  )

  return (
    <Dropdown overlay={userAction} placement="topCenter">
      <UserOutlined />
    </Dropdown>
  )
}
