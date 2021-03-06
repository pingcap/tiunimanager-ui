/*
 * Copyright 2022 PingCAP
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useEffect, useMemo, useState } from 'react'
import { ProColumns } from '@ant-design/pro-table'
import {
  Button,
  Form,
  FormInstance,
  message,
  Modal,
  Space,
  Table,
  TableColumnsType,
} from 'antd'
import {
  // EditOutlined,
  ExclamationCircleOutlined,
  QuestionCircleOutlined,
  RollbackOutlined,
  SaveOutlined,
} from '@ant-design/icons'
import HeavyTable from '@/components/HeavyTable'
import { ClusterInfo, ClusterParamItem } from '@/api/model'
import {
  invalidateClusterParams,
  useQueryClusterParams,
  useUpdateClusterParams,
} from '@/api/hooks/cluster'
import IntlPopConfirm from '@/components/IntlPopConfirm'
import { useQueryClient } from 'react-query'
import { TFunction } from 'react-i18next'
import { loadI18n, useI18n } from '@i18n-macro'
import { Link } from 'react-router-dom'
import { resolveRoute } from '@pages-macro'
import { isArray } from '@/utils/types'
import { renderRange } from './helper'
// import { usePagination } from '@hooks/usePagination'

loadI18n()

export interface ParamsTableProps {
  cluster: ClusterInfo
}

const getRowKey = (record: ClusterParamItem) => record.paramId!

export function ParamsTable({ cluster }: ParamsTableProps) {
  const { t, i18n } = useI18n()
  const {
    paramGroupId,
    paramList: originalData,
    refetch,
    isLoading,
  } = useFetchParamsData(cluster.clusterId!)

  const [tableData, setTableData] = useState<ClusterParamItem[]>([])

  useEffect(() => {
    !isLoading && setTableData(originalData!)
  }, [isLoading, originalData])

  const [form] = Form.useForm()

  const queryClient = useQueryClient()
  const updateParams = useUpdateClusterParams()

  const handleSave = () => {
    const changes = findParamsChanges(originalData!, tableData)
    if (changes.length === 0) {
      message.info(t('save.nochanges'))
    } else {
      const rebootNeeded = changes.some((change) => change.reboot)

      Modal.confirm({
        title: t('save.confirm'),
        icon: <ExclamationCircleOutlined />,
        width: 600,
        content: <ConfirmTable changes={changes} />,
        okText: rebootNeeded
          ? t('save.okText.reboot')
          : t('save.okText.normal'),
        async onOk() {
          updateParams.mutateAsync(
            {
              payload: {
                clusterId: cluster.clusterId!,
                params: changes.map((change) => ({
                  paramId: change.paramId,
                  realValue: {
                    clusterValue: change.change[1],
                  },
                })),
                // TODO
                reboot: rebootNeeded,
              },
              options: {
                successMessage: t('save.message.success'),
                errorMessage: t('save.message.failed'),
              },
            },
            {
              onSettled() {
                invalidateClusterParams(queryClient, cluster.clusterId!)
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
        setTableData(originalData!)
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
        paramGroupId ? (
          <Space size="middle">
            <span>{t('header.title')}</span>
            <Link
              to={`${resolveRoute('../../../')}/param-group/${paramGroupId}`}
            >
              {paramGroupId}
            </Link>
          </Space>
        ) : (
          ''
        )
      }
      tooltip={false}
      columns={columns}
      pagination={false}
      scroll={{ x: 1600, y: 700 }}
      options={{
        density: false,
        fullScreen: false,
        setting: false,
        reload: () => refetch(),
      }}
      rowKey={getRowKey}
      toolBarRender={toolbar}
      editable={{
        type: 'single',
        form,
        saveText: t('actions.confirm'),
        actionRender: (_, __, dom) => [dom.save, dom.cancel],
        onSave: async (paramId, editedRow) => {
          setTableData((prev) =>
            prev.map((row) => {
              if (row.paramId !== paramId) return row

              return {
                ...row,
                realValue: {
                  ...row.realValue,
                  clusterValue:
                    editedRow.realValue?.clusterValue || row.defaultValue,
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
      title: t('model:clusterParam.property.component'),
      width: 100,
      fixed: 'left',
      dataIndex: 'instanceType',
      editable: false,
    },
    {
      title: t('model:clusterParam.property.category'),
      width: 100,
      fixed: 'left',
      dataIndex: 'category',
      editable: false,
    },
    {
      title: t('model:clusterParam.property.name'),
      width: 160,
      fixed: 'left',
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
      title: t('model:clusterParam.property.range'),
      width: 180,
      key: 'range',
      renderText(_, record) {
        return isArray(record.range) && record.range.length > 0
          ? renderRange(record.range, record.rangeType!)
          : null
      },
      editable: false,
    },
    {
      title: t('model:clusterParam.property.default'),
      width: 120,
      dataIndex: 'defaultValue',
      editable: false,
    },
    {
      title: t('model:clusterParam.property.current'),
      width: 120,
      dataIndex: ['realValue', 'clusterValue'],
      // render(_, record, __, action) {
      //   return (
      //     <span
      //       onClick={() => {
      //         form.resetFields()
      //         action?.startEditable(record.paramId!)
      //       }}
      //       style={{ cursor: 'pointer' }}
      //     >
      //       <EditOutlined /> {record.realValue?.clusterValue}
      //     </span>
      //   )
      // },
    },
    {
      title: t('columns.actions'),
      valueType: 'option',
      width: 140,
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
    {
      title: t('model:clusterParam.property.desc'),
      dataIndex: 'description',
      editable: false,
    },
  ]
  return columns
}

function useFetchParamsData(id: string) {
  // const [pagination, setPagination] = usePagination(40)
  const { data, isLoading, refetch } = useQueryClusterParams(
    {
      id,
    },
    { refetchOnWindowFocus: false }
  )
  const result = data?.data.data

  return {
    // pagination,
    // setPagination,
    paramGroupId: result?.paramGroupId,
    paramList: result?.params,
    isLoading,
    refetch,
  }
}

type Change = {
  paramId: string
  component: string
  name: string
  change: [string, string]
  reboot: number
}

function findParamsChanges(
  origin: ClusterParamItem[],
  table: ClusterParamItem[]
) {
  const changes: Change[] = []
  origin.forEach((raw, i) => {
    if (raw.realValue?.clusterValue !== table[i].realValue?.clusterValue) {
      changes.push({
        paramId: raw.paramId!,
        component: raw.instanceType!,
        name: raw.name!,
        change: [
          raw.realValue!.clusterValue!,
          table[i].realValue!.clusterValue!,
        ],
        reboot: raw.hasReboot!,
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
        title: t('save.fields.component'),
        dataIndex: 'component',
        key: 'component',
      },
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
      {
        title: t('save.fields.reboot'),
        key: 'reboot',
        render(_, record) {
          return record.reboot!
            ? t('model:clusterParam.reboot.true')
            : t('model:clusterParam.reboot.false')
        },
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
      scroll={{ y: 400 }}
    />
  )
}
