import { ProColumns } from '@ant-design/pro-table'
import HeavyTable from '@/components/HeavyTable'
import { HostapiHostInfo } from '#/api'
import { APIS } from '@/api/client'
import { useState } from 'react'
import { useAuthState } from '@store/auth'

// TODO: i18n for hosts table

const hostColumns: ProColumns<HostapiHostInfo>[] = [
  {
    title: 'ID',
    width: 80,
    dataIndex: 'hostId',
  },
  {
    title: 'IP',
    width: 80,
    dataIndex: 'hostIp',
  },
  {
    title: '名称',
    width: 80,
    dataIndex: 'hostName',
  },
]

export default function HostTable() {
  const [{ token }] = useAuthState()
  const [total, setTotal] = useState(0)
  return (
    <HeavyTable
      headerTitle={<h3>主机列表</h3>}
      tooltip={false}
      columns={hostColumns}
      pagination={{
        pageSize: 15,
        total,
        showSizeChanger: false,
      }}
      rowKey="hostId"
      request={async (params) => {
        // TODO: Use react-query instead.
        const resp = await APIS.Resource.hostQueryPost(token, {
          // TODO: does page index start from 0?
          page: (params.current || 1) - 1,
          pageSize: params.pageSize,
        })

        setTotal((resp.data as any).page?.total || 0)

        // TODO: handle errors
        return {
          data: resp.data.data,
          success: true,
        }
      }}
    />
  )
}
