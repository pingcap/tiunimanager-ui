import { FC } from 'react'
import MainLayout from '@apps/main/layout'
import { importMenus } from '@import-pages-macro'
import { IPageMeta } from '@/model/page'

const menuItems = importMenus<IPageMeta>('./', '/')

const Main: FC = ({ children }) => {
  return <MainLayout menuItems={menuItems}>{children}</MainLayout>
}

export default Main
