import { PropsWithChildren } from 'react'
import ProTable, { ProTableProps } from '@ant-design/pro-table'

const defaultTableProps = {
  // bordered: true,
  size: 'middle',
  showHeader: true,
  search: false,
} as const

export default function HeavyTable<T, U, R>({
  pagination,
  options,
  columnsState,
  ...props
}: PropsWithChildren<ProTableProps<T, U, R>>) {
  return (
    <ProTable
      {...defaultTableProps}
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
