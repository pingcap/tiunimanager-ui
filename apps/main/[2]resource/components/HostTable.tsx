import { ColumnsState, ProColumns } from '@ant-design/pro-table'
import HeavyTable from '@/components/HeavyTable'
import { HostapiHostInfo } from '#/api'
import { APIS } from '@/api/client'
import { useMemo } from 'react'
import { useAuthState } from '@store/auth'
import { Button, message, Popconfirm } from 'antd'
import { PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import useLocalStorage from '@hooks/useLocalstorage'
import UploadModal from '@apps/main/[2]resource/components/UploadModal'
import useToggle from '@hooks/useToggle'

function getHostColumns(token: string): ProColumns<HostapiHostInfo>[] {
  return [
    {
      title: 'ID',
      width: 140,
      dataIndex: 'hostId',
      key: 'id',
      hideInSearch: true,
    },
    {
      title: '主机名',
      width: 120,
      dataIndex: 'hostName',
      key: 'hostName',
      hideInSearch: true,
    },
    {
      title: 'IP',
      width: 140,
      dataIndex: 'ip',
      key: 'ip',
      hideInSearch: true,
    },
    {
      title: '状态',
      width: 80,
      dataIndex: 'status',
      key: 'status',
      valueType: 'select',
      // TODO: add i18n
      valueEnum: {
        0: { text: '空闲中', status: 'Success' },
        1: { text: '已下线', status: 'Default' },
        2: { text: '使用中', status: 'Processing' },
        3: { text: '已满载', status: 'Warning' },
        4: { text: '已删除', status: 'Error' },
      },
    },
    {
      title: '位置',
      width: 200,
      key: 'location',
      tooltip: '可用区 数据中心 机架',
      hideInSearch: true,
      render(_, record) {
        return `${record.az}, ${record.dc}, ${record.rack}`
      },
    },
    {
      title: '网卡',
      width: 120,
      dataIndex: 'nic',
      key: 'nic',
      hideInSearch: true,
    },
    {
      title: '类型',
      width: 80,
      dataIndex: 'purpose',
      key: 'purpose',
      // TODO: ignore purpose in sprint 1
      hideInSearch: true,
    },
    {
      title: '系统信息',
      width: 140,
      key: 'system',
      render(_, record) {
        return `${record.os} ${record.kernel}`
      },
      hideInSearch: true,
    },
    {
      title: '可用规格',
      width: 130,
      key: 'availableSpec',
      render(_, record) {
        return `${record.cpuCores} Core ${record.memory} GB`
      },
      hideInSearch: true,
    },
    {
      title: '总规格',
      width: 130,
      dataIndex: 'spec',
      key: 'spec',
      hideInSearch: true,
    },
    {
      title: '操作',
      width: 120,
      key: 'actions',
      valueType: 'option',
      render(_, record, i, action) {
        const editAction = getActionOfStatus(record.status!)
        return [
          editAction ? <a key="edit">{editAction}</a> : <span />,
          <a key="monitor">监控</a>,
          <Popconfirm
            key="delete"
            title="确认删除该主机吗"
            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
            onConfirm={async () => {
              try {
                await APIS.Resource.hostHostIdDelete(token, record.hostId!)
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

function getActionOfStatus(status: number) {
  switch (status) {
    case 0:
    case 2:
      return '上线'
    case 1:
      return '下线'
  }
  return undefined
}

const defaultColumnsSetting: Record<string, ColumnsState> = {
  id: {
    show: false,
  },
  spec: {
    show: false,
  },
  actions: {
    fixed: 'right',
  },
}

export default function HostTable() {
  // TODO: add pagination after api supports
  const [{ token }] = useAuthState()
  // const [total, setTotal] = useState(0)
  const hostColumns = useMemo(() => getHostColumns(token), [token])

  const [columnsSetting, setColumnSetting] = useLocalStorage(
    'host-table-show',
    defaultColumnsSetting
  )

  const [uploaderVisible, toggleUploaderVisible] = useToggle(false)

  return (
    <>
      <HeavyTable
        headerTitle={
          <Button
            type="primary"
            key="import"
            onClick={() => toggleUploaderVisible()}
          >
            <PlusOutlined /> 导入主机
          </Button>
        }
        tooltip={false}
        columns={hostColumns}
        // pagination={{
        //   pageSize: 15,
        //   total,
        //   showSizeChanger: false,
        // }}
        pagination={false}
        rowKey="hostId"
        columnsStateMap={columnsSetting}
        search={{
          filterType: 'light',
        }}
        onColumnsStateChange={(m) => setColumnSetting(m)}
        request={async (params) => {
          const { purpose, status } = params as any
          // TODO: Use react-query instead.
          // const resp = await APIS.Resource.hostsGet(token, {
          //   // TODO: does page index start from 0?
          //   page: (params.current || 1) - 1,
          //   pageSize: params.pageSize,
          // })
          const resp = await APIS.Resource.hostsGet(token, purpose, status)

          // setTotal((resp.data as any).page?.total || 0)

          // TODO: handle errors
          return {
            data: resp.data.data,
            success: true,
          }
        }}
      />
      <UploadModal visible={uploaderVisible} close={toggleUploaderVisible} />
    </>
  )
}
