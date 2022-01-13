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
