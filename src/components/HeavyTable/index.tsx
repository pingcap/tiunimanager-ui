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
import ProTable, { ProTableProps } from '@ant-design/pro-table'

export default function HeavyTable<T, U, R>({
  pagination,
  options,
  columnsState,
  search = false,
  size = 'middle',
  showHeader = true,
  scroll = {
    x: 1280,
  },
  ...props
}: PropsWithChildren<ProTableProps<T, U, R>>) {
  return (
    <ProTable
      showHeader={showHeader}
      size={size}
      search={search}
      pagination={
        pagination === false
          ? false
          : {
              pageSize: 10,
              ...pagination,
            }
      }
      options={{
        density: false,
        fullScreen: true,
        setting: true,
        ...options,
      }}
      locale={{
        emptyText: '',
      }}
      columnsState={{
        persistenceType: 'localStorage',
        ...columnsState,
      }}
      scroll={scroll}
      {...props}
      toolBarRender={props.toolBarRender}
    />
  )
}
