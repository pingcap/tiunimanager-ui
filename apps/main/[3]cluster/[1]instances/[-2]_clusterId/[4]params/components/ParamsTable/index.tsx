import HeavyTable from '@/components/HeavyTable'
import { useEffect, useMemo, useState } from 'react'
import { ProColumns } from '@ant-design/pro-table'
import {
  Button,
  Form,
  FormInstance,
  message,
  Modal,
  Table,
  TableColumnsType,
} from 'antd'
import {
  EditOutlined,
  ExclamationCircleOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  RollbackOutlined,
  SaveOutlined,
} from '@ant-design/icons'
import { ClusterInfo, PagedResult, ClusterParamItem } from '@/api/model'
import {
  invalidateClusterParams,
  useQueryClusterParams,
  useUpdateClusterParams,
} from '@/api/hooks/cluster'
import IntlPopConfirm from '@/components/IntlPopConfirm'
import { useQueryClient } from 'react-query'
import { loadI18n, useI18n } from '@i18n-macro'
import { TFunction } from 'react-i18next'
import { errToMsg } from '@/utils/error'
import { usePagination } from '@hooks/usePagination'

loadI18n()

export interface ParamsTableProps {
  cluster: ClusterInfo
}

const TableOptions = {
  density: false,
  fullScreen: false,
  setting: false,
  reload: false,
}

const getRowKey = (record: ClusterParamItem) => record.paramId!

export function ParamsTable({ cluster }: ParamsTableProps) {
  const { t, i18n } = useI18n()
  const {
    data: originalData,
    refetch,
    isLoading,
    setPagination,
    pagination,
  } = useFetchParamsData(cluster.clusterId!)

  const [tableData, setTableData] = useState<ClusterParamItem[]>([])

  useEffect(() => {
    !isLoading && setTableData(originalData!.data.data!)
  }, [isLoading, originalData])

  const [form] = Form.useForm()

  const queryClient = useQueryClient()
  const updateParams = useUpdateClusterParams()

  const handleSave = () => {
    const changes = findParamsChanges(originalData!.data.data!, tableData)
    if (changes.length === 0) {
      message.info(t('save.nochanges'))
    } else {
      Modal.confirm({
        title: t('save.confirm'),
        icon: <ExclamationCircleOutlined />,
        width: 600,
        content: <ConfirmTable changes={changes} />,
        async onOk() {
          updateParams.mutateAsync(
            {
              clusterId: cluster.clusterId!,
              params: changes.map((change) => ({
                paramId: change.paramId,
                realValue: {
                  cluster: change.change[1],
                },
              })),
            },
            {
              onSuccess() {
                message.success(t('save.success'))
              },
              onSettled() {
                invalidateClusterParams(queryClient, cluster.clusterId!)
              },
              onError(e: any) {
                message.error(
                  t('save.fail', {
                    msg: errToMsg(e),
                  })
                )
              },
            }
          )
        },
      })
    }
  }

  const toolbar = () => [
    <IntlPopConfirm
      key="reset"
      title={t('reset.confirm')}
      icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
      onConfirm={() => {
        setTableData(originalData!.data.data!)
      }}
    >
      <Button>
        <RollbackOutlined /> {t('actions.reset')}
      </Button>
    </IntlPopConfirm>,
    <Button type="primary" key="submit" onClick={handleSave}>
      <SaveOutlined /> {t('actions.save')}
    </Button>,
  ]

  const columns = useMemo(() => getColumns(t, form), [form, i18n.language])

  return (
    <HeavyTable
      loading={isLoading}
      dataSource={tableData}
      headerTitle={
        <Button key="refresh" onClick={() => refetch()}>
          <ReloadOutlined /> {t('actions.refresh')}
        </Button>
      }
      tooltip={false}
      columns={columns}
      pagination={{
        pageSize: pagination.pageSize,
        current: pagination.page,
        total: (originalData?.data as PagedResult)?.page?.total || 0,
        onChange(page, pageSize) {
          setPagination({ page, pageSize: pageSize || pagination.pageSize })
        },
      }}
      options={TableOptions}
      rowKey={getRowKey}
      toolBarRender={toolbar}
      editable={{
        type: 'single',
        form,
        actionRender: (_, __, dom) => [dom.save, dom.cancel],
        onSave: async (paramId, editedRow) => {
          setTableData((prev) =>
            prev.map((row) => {
              if (row.paramId !== paramId) return row

              return {
                ...row,
                realValue: {
                  ...row.realValue,
                  cluster: editedRow.realValue?.cluster || row.defaultValue,
                },
              }
            })
          )
        },
      }}
    />
  )
}

function getColumns(t: TFunction<''>, form: FormInstance) {
  const columns: ProColumns<ClusterParamItem>[] = [
    {
      title: t('model:clusterParam.property.name'),
      width: 160,
      dataIndex: 'name',
      editable: false,
    },
    {
      title: t('model:clusterParam.property.reboot'),
      width: 80,
      key: 'hasReboot',
      render(_, record) {
        return record.hasReboot!
          ? t('model:clusterParam.reboot.true')
          : t('model:clusterParam.reboot.false')
      },
      editable: false,
    },
    {
      title: t('model:clusterParam.property.desc'),
      dataIndex: 'description',
      editable: false,
      ellipsis: true,
    },
    {
      title: t('model:clusterParam.property.range'),
      width: 200,
      key: 'range',
      render(_, record) {
        const range = record.range!
        const unit = record.unit!
        // TODO: handle different types
        return range.map((rangeValue) => `${rangeValue} ${unit}`).join(', ')
      },
      editable: false,
    },
    {
      title: t('model:clusterParam.property.default'),
      width: 160,
      dataIndex: 'defaultValue',
      editable: false,
    },
    {
      title: t('model:clusterParam.property.current'),
      width: 180,
      dataIndex: ['realValue', 'cluster'],
      render(_, record, __, action) {
        return (
          <span
            onClick={() => {
              form.resetFields()
              action?.startEditable(record.paramId!)
            }}
            style={{ cursor: 'pointer' }}
          >
            <EditOutlined /> {record.realValue?.cluster}
          </span>
        )
      },
    },
    {
      title: t('columns.actions'),
      valueType: 'option',
      width: 100,
      render: (_, record, __, action) => {
        return (
          <a
            key="editable"
            onClick={() => {
              form.resetFields()
              action?.startEditable?.(record.paramId!)
            }}
          >
            {t('actions.edit')}
          </a>
        )
      },
    },
  ]
  return columns
}

function useFetchParamsData(id: string) {
  const [pagination, setPagination] = usePagination(40)
  const { data, isLoading, refetch } = useQueryClusterParams(
    {
      id,
      ...pagination,
    },
    { refetchOnWindowFocus: false }
  )
  return {
    pagination,
    setPagination,
    data,
    isLoading,
    refetch,
  }
}

type Change = {
  paramId: number
  name: string
  change: [string, string]
}

function findParamsChanges(
  origin: ClusterParamItem[],
  table: ClusterParamItem[]
) {
  const changes: Change[] = []
  origin.forEach((raw, i) => {
    if (raw.realValue?.cluster !== table[i].realValue?.cluster) {
      changes.push({
        paramId: raw.paramId!,
        name: raw.name!,
        change: [raw.realValue!.cluster!, table[i].realValue!.cluster!],
      })
    }
  })
  return changes
}

function ConfirmTable({ changes }: { changes: Change[] }) {
  const { t, i18n } = useI18n()
  const columns: TableColumnsType<Change> = useMemo(
    () => [
      {
        title: t('save.fields.name'),
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: t('save.fields.before'),
        key: 'before',
        render: (_, record) => record.change[0],
      },
      {
        title: t('save.fields.after'),
        key: 'after',
        render: (_, record) => record.change[1],
      },
    ],
    [i18n.language]
  )
  return (
    <Table
      dataSource={changes}
      pagination={false}
      rowKey="name"
      size="small"
      columns={columns}
    />
  )
}
