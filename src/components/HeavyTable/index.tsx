import { PropsWithChildren } from 'react'
import ProTable, { ProTableProps } from '@ant-design/pro-table'

const defaultTableProps = {
  bordered: true,
  size: 'middle',
  headerTitle: '列表',
  tooltip: '列表',
  showHeader: true,
  search: false,
} as const

export default function HeavyTable<T, U, R>({
  pagination,
  options,
  ...props
}: PropsWithChildren<ProTableProps<T, U, R>>) {
  return (
    <ProTable
      {...defaultTableProps}
      pagination={{
        pageSize: 10,
        ...pagination,
      }}
      options={{
        density: true,
        fullScreen: true,
        setting: true,
        ...options,
      }}
      {...props}
      toolBarRender={props.toolBarRender}
    />
  )
}
