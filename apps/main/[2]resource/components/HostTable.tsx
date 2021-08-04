import { ProColumns } from '@ant-design/pro-table'
import HeavyTable from '@/components/HeavyTable'
import { HostapiHostInfo } from '#/api'
import { APIS } from '@/api/client'
import { useMemo, useState } from 'react'
import { useAuthState } from '@store/auth'
import { message, Popconfirm } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'

function getHostColumns(token: string): ProColumns<HostapiHostInfo>[] {
  return [
    {
      title: 'ID',
      width: 100,
      dataIndex: 'hostName',
      key: 'hostName',
    },
    {
      title: 'IP',
      width: 100,
      dataIndex: 'ip',
      key: 'ip',
    },
    {
      title: '状态',
      width: 100,
      dataIndex: 'status',
      key: 'status',
      // TODO: valueEnum
    },
    {
      title: '位置',
      width: 180,
      key: 'position',
      tooltip: '可用区 数据中心 机架',
      render(_, record) {
        return `${record.az} ${record.dc} ${record.rack}`
      },
    },
    {
      title: '网络',
      width: 180,
      dataIndex: 'nic',
      key: 'nic',
    },
    {
      title: '类型',
      width: 100,
      dataIndex: 'purpose',
      key: 'purpose',
    },
    {
      title: '系统信息',
      width: 100,
      key: 'system',
      render(_, record) {
        return `${record.os} ${record.kernel}`
      },
    },
    {
      title: '硬件信息',
      width: 130,
      key: 'hardware',
      render(_, record) {
        return `${record.cpuCores} Core ${record.memory}Gb RAM`
      },
    },
    {
      title: '操作',
      width: 140,
      key: 'actions',
      valueType: 'option',
      render(_, record, i, action) {
        return [
          <a key="edit">上线</a>,
          <a key="monitor">监控</a>,
          <Popconfirm
            key="delete"
            title="确认删除该主机吗"
            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
            onConfirm={async () => {
              try {
                await APIS.Resource.hostHostIdDelete(
                  token,
                  // TODO: FIXME: where is the hostId?
                  record.hostName!
                )
                message.success(`删除主机 ${record.hostName} 成功`)
                action?.reload()
              } catch (e) {
                message.error(
                  `删除失败: ${(e.response?.data?.message ?? e) || '未知原因'}`
                )
              }
            }}
          >
            <a className="danger-link">删除</a>
          </Popconfirm>,
        ]
      },
    },
  ]
}

export default function HostTable() {
  const [{ token }] = useAuthState()
  const [total, setTotal] = useState(0)
  const hostColumns = useMemo(() => getHostColumns(token), [token])
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
