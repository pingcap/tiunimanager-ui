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

import { useTranslation } from 'react-i18next'
import { FC, useMemo } from 'react'
import { LANGUAGE_IDS, LANGUAGES } from '@/i18n'
import { Dropdown, DropDownProps, Menu } from 'antd'

export interface LanguageDropdownProps {
  placement?: DropDownProps['placement']
  className?: string
}

const LanguageDropdown: FC<LanguageDropdownProps> = ({
  children,
  placement = 'bottomRight',
  className = '',
}) => {
  const { i18n } = useTranslation()
  // invariant
  const languageOptions = useMemo(
    () =>
      LANGUAGE_IDS.map((key) => (
        <Menu.Item key={key}>{LANGUAGES[key].display}</Menu.Item>
      )),
    []
  )

  const menu = useMemo(
    () => (
      <Menu
        onClick={(e) => i18n.changeLanguage(e.key)}
        selectedKeys={[i18n.language]}
      >
        {languageOptions}
      </Menu>
    ),
    [i18n.language]
  )

  return (
    <Dropdown overlay={menu} className={className} placement={placement}>
      {children}
    </Dropdown>
  )
}

export default LanguageDropdown
