/*
 * Copyright 2022 PingCAP, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { FC, useMemo } from 'react'
import { Dropdown, Layout, Menu, MenuProps } from 'antd'
import { matchPath, useHistory, useLocation } from 'react-router-dom'
import styles from './SideMenu.module.less'
import {
  GlobalOutlined,
  LeftOutlined,
  RightOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons'
import LanguageDropdown from '@/components/LanguageDropdown'
import { IPageMeta } from '@/model/page'
import { IMenuItem } from '@pages-macro'
import { useTranslation } from 'react-i18next'
import useToggle from '@hooks/useToggle'
import { useAuthState } from '@store/auth'
import { doUserLogout } from '@/api/hooks/platform'
import { loadI18n, useI18n } from '@i18n-macro'
import { Logo } from '@/components/Logo'

loadI18n()

export interface SideMenuProps extends MenuProps {
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
  items,
  width,
}) => {
  const location = useLocation()
  const [collapsed, toggleCollapsed] = useToggle(defaultCollapsed ?? false)
  const matchedKeys = useMemo(
    () => getMatchedMenuItemKeys(items, location.pathname),
    [location.pathname]
  )
  const selectedKey = matchedKeys[matchedKeys.length - 1]
  const CollapseIcon = collapsed ? RightOutlined : LeftOutlined
  const menus = useMenus(items)

  return (
    <Layout.Sider
      width={width}
      className={styles.sider}
      collapsedWidth={collapsedWidth}
      theme="dark"
      collapsible
      collapsed={collapsed}
      trigger={null}
    >
      <Logo className={styles.logo} type="commonLight" logoWidth={100} />
      <Menu
        theme="dark"
        mode="inline"
        className={styles.menu}
        selectedKeys={[selectedKey]}
        defaultOpenKeys={matchedKeys}
      >
        {menus}
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
  const dispatchLogout = useAuthState((state) => state.logout)
  const { t } = useI18n()
  const userAction = (
    <Menu>
      <Menu.Item
        key="logout"
        title={t('actions.logout')}
        onClick={() => {
          doUserLogout().then(dispatchLogout)
        }}
      >
        {/* TODO: logout & i18n */}
        {t('actions.logout')}
      </Menu.Item>
    </Menu>
  )

  return (
    <Dropdown overlay={userAction} placement="topCenter">
      <UserOutlined />
    </Dropdown>
  )
}

function useMenus(rawItems: IMenuItem<IPageMeta>[]) {
  const { t, i18n } = useTranslation()
  const history = useHistory()
  return useMemo(() => {
    const getItemName = (item: IMenuItem<IPageMeta>) =>
      t(`${item.id}:name`, item.defaultName)

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
                history.location.pathname !== item.path &&
                history.push(item.path)
              }
            >
              {getItemName(item)}
            </Menu.Item>
          )
        }
      })
    }
    return renderMenu(rawItems)
  }, [i18n.language, history, rawItems])
}
