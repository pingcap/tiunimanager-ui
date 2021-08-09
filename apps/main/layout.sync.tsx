import { PropsWithChildren } from 'react'
import MainLayout from '@apps/main/layouts'
import { loadMenus } from '@pages-macro'
import { IPageMeta } from '@/model/page'

const menuItems = loadMenus<IPageMeta>('.')

export default function ({ children }: PropsWithChildren<{}>) {
  return <MainLayout menuItems={menuItems}>{children}</MainLayout>
}
