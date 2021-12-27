import { FC, useState, useMemo, useEffect, useRef } from 'react'
import { TFunction } from 'react-i18next'
import { loadI18n, useI18n } from '@i18n-macro'
import { Card, Form, FormInstance } from 'antd'
import { ActionType, ProColumns } from '@ant-design/pro-table'
import HeavyTable from '@/components/HeavyTable'
import { ParamItemDetail } from '@/api/model'
import { EditOutlined } from '@ant-design/icons'
import { isArray } from '@/utils/types'

import styles from './index.module.less'
import { renderRange } from './helper'

loadI18n()

function getColumns(
  t: TFunction<''>,
  form: FormInstance,
  saveKey: (key: string) => void
) {
  const columns: ProColumns<ParamItemDetail>[] = [
    {
      title: t('model:clusterParam.property.name'),
      width: 220,
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      editable: false,
    },
    {
      title: t('model:clusterParam.property.reboot'),
      width: 80,
      dataIndex: 'hasReboot',
      key: 'reboot',
      render(_, record) {
        return record.hasReboot!
          ? t('model:clusterParam.reboot.true')
          : t('model:clusterParam.reboot.false')
      },
      editable: false,
    },
    {
      title: t('model:clusterParam.property.range'),
      width: 200,
      key: 'range',
      ellipsis: true,
      renderText(_, record) {
        return isArray(record.range) && record.range.length > 0
          ? renderRange(record.type!, record.range, record.unit)
          : null
      },
      editable: false,
    },
    {
      title: t('model:clusterParam.property.default'),
      width: 160,
      dataIndex: 'defaultValue',
      key: 'defaultValue',
      render(node, record, idx, action) {
        return (
          <span
            onClick={() => {
              form.resetFields([record.paramId!])
              action?.startEditable(record.paramId!)
              saveKey(record.paramId!)
            }}
            style={{ cursor: 'pointer' }}
          >
            <EditOutlined /> {record.defaultValue}
          </span>
        )
      },
      formItemProps: () => {
        // const recordValType = config.entity.type

        return {
          rules: [{ required: true, message: t('card.rules.required') }],
        }
      },
    },
    {
      title: t('columns.actions'),
      valueType: 'option',
      width: 100,
      render: (node, record, idx, action) => {
        return (
          <a
            key="editable"
            onClick={() => {
              form.resetFields([record.paramId!])
              action?.startEditable?.(record.paramId!)
              saveKey(record.paramId!)
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
      key: 'description',
      ellipsis: true,
      editable: false,
    },
  ]

  return columns
}

const getRowKey = (record: ParamItemDetail) => record.paramId!

const TableOptions = {
  density: false,
  fullScreen: false,
  setting: false,
  reload: false,
}

interface ParamCardProps {
  loading: boolean
  data?: ParamItemDetail[]
  onEdit: (editing: boolean) => void
  onSave: (paramList: ParamItemDetail[]) => void
}

type ComponentParamMap = {
  [k: string]: ParamItemDetail[]
}

const ParamCard: FC<ParamCardProps> = ({ loading, data, onEdit, onSave }) => {
  const componentParamMap = useMemo(() => {
    if (!isArray(data)) {
      return {}
    }

    const hashmap = data.reduce((prev, item) => {
      const { instanceType: componentType = '' } = item

      if (!componentType) {
        return prev
      }

      if (!Array.isArray(prev[componentType])) {
        prev[componentType] = [item]
      } else {
        prev[componentType].push(item)
      }

      return prev
    }, {} as ComponentParamMap)

    return hashmap
  }, [data])

  const tabList = useMemo(
    () =>
      Object.keys(componentParamMap).map((name) => ({
        key: name,
        tab: name,
      })),
    [componentParamMap]
  )

  const [activeTab, setActiveTab] = useState(tabList?.[0]?.key)

  const [editingKey, setEditingKey] = useState<string>()

  const [tableDataMap, setTableDataMap] = useState<{
    [k: string]: ParamItemDetail[]
  }>({})

  const { t, i18n } = useI18n()

  const [paramForm] = Form.useForm()

  const columns = useMemo(
    () => getColumns(t, paramForm, setEditingKey),
    [i18n.language, paramForm]
  )

  const editorRef = useRef<ActionType>()

  useEffect(() => {
    if (loading) {
      return
    }

    const dataMap = Object.entries(componentParamMap).reduce(
      (prev, [name, data]) => {
        if (!name) {
          return prev
        }

        prev[name] = data.concat()

        return prev
      },
      {} as { [k: string]: ParamItemDetail[] }
    )

    setTableDataMap(dataMap)
    setActiveTab(Object.keys(componentParamMap)[0])
  }, [loading, componentParamMap])

  useEffect(() => {
    if (editingKey) {
      editorRef.current?.cancelEditable(editingKey)
      setEditingKey(undefined)
    }
  }, [data])

  useEffect(() => {
    const isEditing = !!editingKey

    onEdit(isEditing)
  }, [editingKey])

  useEffect(() => {
    const changedParamList = Object.values(tableDataMap).reduce(
      (prev, list) => prev.concat(list),
      []
    )

    onSave(changedParamList)
  }, [tableDataMap])

  return (
    <Card
      className={styles.paramCard}
      title={t('card.title')}
      size="small"
      tabList={tabList}
      activeTabKey={activeTab}
      tabProps={{ size: 'middle' }}
      onTabChange={(key) => {
        if (editingKey) {
          editorRef.current?.cancelEditable(editingKey)
          setEditingKey(undefined)
        }

        setActiveTab(key)
      }}
    >
      <HeavyTable
        loading={loading}
        actionRef={editorRef}
        dataSource={tableDataMap[activeTab]}
        tooltip={false}
        columns={columns}
        pagination={false}
        options={TableOptions}
        rowKey={getRowKey}
        scroll={{ x: 1200, y: 600 }}
        editable={{
          type: 'single',
          form: paramForm,
          actionRender: (row, config, dom) => [dom.save, dom.cancel],
          onSave: async (paramId, editedRow) => {
            setTableDataMap((prev) => {
              const mapKey = editedRow.instanceType!
              const prevTableData = prev[mapKey]
              const newTableData = prevTableData.map((row) => {
                if (row.paramId !== paramId) {
                  return row
                }

                return {
                  ...row,
                  defaultValue: editedRow.defaultValue,
                }
              })

              return {
                ...prev,
                [mapKey]: newTableData,
              }
            })

            setEditingKey(undefined)
          },
          onCancel: async () => {
            setEditingKey(undefined)
          },
        }}
      />
    </Card>
  )
}

export default ParamCard
