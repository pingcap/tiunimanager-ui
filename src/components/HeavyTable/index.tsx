import { PropsWithChildren } from 'react'
import ProTable, { ProTableProps } from '@ant-design/pro-table'

export default function HeavyTable<T, U, R>({
  pagination,
  options,
  columnsState,
  search = false,
  size = 'middle',
  showHeader = true,
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
      {...props}
      toolBarRender={props.toolBarRender}
    />
  )
}
