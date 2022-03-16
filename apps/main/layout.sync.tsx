import { PropsWithChildren } from 'react'
import MainLayout from '@apps/main/layouts'
import { loadMenus } from '@pages-macro'
import { IPageMeta } from '@/model/page'
import { Spin } from 'antd'
import { useGetStarted } from './helpers'
import { Redirect } from 'react-router'

const menuItems = loadMenus<IPageMeta>('.')

export default function ({ children }: PropsWithChildren<{}>) {
  const { loading, forcedToStart, startPath, isAtStart } = useGetStarted()

  if (loading) {
    return <Spin />
  }

  if (forcedToStart) {
    return <Redirect to={{ pathname: startPath }} />
  }

  return (
    <MainLayout siderDisabled={isAtStart} menuItems={menuItems}>
      {children}
    </MainLayout>
  )
}
