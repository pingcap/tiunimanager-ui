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
