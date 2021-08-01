import { ActionType, ProColumns } from '@ant-design/pro-table'
import { InstanceapiInstanceInfo } from '#/api'
import { APIS } from '@/api/client'
import { useRef, useState } from 'react'
import { Button, Tag, TagProps } from 'antd'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  SyncOutlined,
} from '@ant-design/icons'

import styles from './InstanceTable.module.less'
import { useAuthState } from '@store/auth'
import useToggle from '@hooks/useToggle'
import HeavyTable from '@/components/HeavyTable'
import { CreateForm } from '@apps/main/[3]instances/components/CreateForm'

// TODO: i18n for instances table

type Status = {
  type: TagProps['color']
  text: string
}

const STATUS: Status[] = [
  { type: 'success', text: 'Success' },
  { type: 'success', text: 'Success' },
  { type: 'processing', text: 'Processing' },
  { type: 'default', text: 'Stop' },
  { type: 'default', text: 'Stop' },
  { type: 'warning', text: 'Warning' },
  { type: 'warning', text: 'Warning' },
  { type: 'error', text: 'Error' },
]

function getStatusTag(statusID: number) {
  const { type, text } = STATUS[statusID]
  let Icon
  switch (type) {
    case 'success':
      Icon = CheckCircleOutlined
      break
    case 'processing':
      Icon = SyncOutlined
      break
    case 'warning':
      Icon = ExclamationCircleOutlined
      break
    case 'error':
      Icon = CloseCircleOutlined
      break
    case 'default':
      Icon = MinusCircleOutlined
      break
    default:
      return null
  }
  return (
    <Tag color={type} icon={<Icon />}>
      {text}
    </Tag>
  )
}

const instanceColumns: ProColumns<InstanceapiInstanceInfo>[] = [
  {
    title: 'ID',
    width: 80,
    dataIndex: 'instanceId',
  },
  {
    title: '名称',
    width: 80,
    dataIndex: 'instanceName',
  },
  {
    title: '版本',
    width: 80,
    dataIndex: 'instanceVersion',
  },
  {
    title: '状态',
    width: 80,
    dataIndex: 'instanceStatus',
    render(dom, record) {
      return getStatusTag(record.instanceStatus!)
    },
  },
]

export default function InstanceTable() {
  const [{ token }] = useAuthState()
  const [total, setTotal] = useState(0)
  const [createFormVisible, toggleCreateFormVisible] = useToggle(false)
  const ref = useRef<ActionType>()
  return (
    <>
      <HeavyTable
        className={styles.instanceTable}
        headerTitle={<h3>实例列表</h3>}
        tooltip={false}
        columns={instanceColumns}
        pagination={{
          pageSize: 15,
          total,
          showSizeChanger: false,
        }}
        rowKey="instanceId"
        actionRef={ref}
        toolBarRender={() => [
          <Button
            type="primary"
            key="create"
            onClick={toggleCreateFormVisible as any}
          >
            <PlusOutlined /> 新建实例
          </Button>,
        ]}
        request={async (params) => {
          // TODO: Use react-query instead.
          const resp = await APIS.Instance.instanceQueryPost(token, {
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
      <CreateForm
        onCreated={() => ref.current?.reload()}
        onClose={() => toggleCreateFormVisible()}
        visible={createFormVisible}
      />
    </>
  )
}
