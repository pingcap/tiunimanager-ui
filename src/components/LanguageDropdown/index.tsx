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
