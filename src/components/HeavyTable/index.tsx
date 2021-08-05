import { PropsWithChildren } from 'react'
import ProTable, { ProTableProps } from '@ant-design/pro-table'

const defaultTableProps = {
  // bordered: true,
  size: 'middle',
  headerTitle: '列表',
  tooltip: '列表',
  showHeader: true,
  search: false,
} as const

export default function HeavyTable<T, U, R>({
  pagination,
  options,
  locale,
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
        ...locale,
      }}
      {...props}
      toolBarRender={props.toolBarRender}
    />
  )
}
