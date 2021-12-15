import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { resolveRoute } from '@pages-macro'
import { loadI18n, useI18n } from '@i18n-macro'
import { TFunction } from 'react-i18next'
import { Tooltip } from 'antd'
import { ColumnsState, ProColumns } from '@ant-design/pro-table'
import { usePagination } from '@hooks/usePagination'
import { DeleteConfirm } from '@/components/DeleteConfirm'
import HeavyTable from '@/components/HeavyTable'
import { useQueryParamGroupList } from '@/api/hooks/param-group'
import {
  PagedResult,
  ParamGroupItem,
  ParamGroupDBType,
  ParamGroupCreationType,
} from '@/api/model'
import ParamGroupCopyModal from '../CopyModal'
import { useCopyModal } from '../CopyModal/helper'
import { useDeleteParamGroupAction, useForceUpdateSearch } from './helpers'

import styles from './index.module.less'

loadI18n()

function getColumns(
  t: TFunction<''>,
  searchHidden: boolean,
  deleteAction: (paramGroupId: number) => unknown,
  openCopyModal: (paramGroupId: number) => void
): ProColumns<ParamGroupItem>[] {
  return [
    {
      title: t('model:paramGroup.property.name'),
      width: 200,
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <Link to={`${resolveRoute()}/${record.paramGroupId}`}>
          {record.name}
        </Link>
      ),
    },
    {
      title: t('model:paramGroup.property.type'),
      width: 160,
      dataIndex: 'hasDefault',
      key: 'type',
      valueType: 'select',
      valueEnum: {
        1: { text: t('model:paramGroup.type.system') },
        2: { text: t('model:paramGroup.type.custom') },
      },
    },
    {
      title: t('model:paramGroup.property.scope'),
      width: 160,
      dataIndex: 'groupType',
      key: 'scope',
      valueType: 'select',
      valueEnum: {
        1: { text: t('model:paramGroup.scope.cluster') },
        2: { text: t('model:paramGroup.scope.instance') },
      },
      hideInSearch: searchHidden,
    },
    {
      title: t('model:paramGroup.property.dbType'),
      width: 140,
      dataIndex: 'dbType',
      key: 'dbType',
      valueType: 'select',
      valueEnum: {
        1: { text: t('model:paramGroup.dbType.tidb') },
        2: { text: t('model:paramGroup.dbType.dm') },
      },
    },
    {
      title: t('model:paramGroup.property.dbVersion'),
      width: 160,
      dataIndex: 'version',
      key: 'dbVersion',
    },
    {
      title: t('model:paramGroup.property.desc'),
      width: 180,
      dataIndex: 'note',
      key: 'desc',
      hideInSearch: searchHidden,
    },
    {
      title: t('columns.actions'),
      valueType: 'option',
      width: 140,
      key: 'action',
      render: (_, record) => {
        const isBuiltIn = record.hasDefault === ParamGroupCreationType.system

        return [
          isBuiltIn ? (
            <Tooltip title={t('edit.disabled')} key="edit">
              <span className={styles.disabled}>{t('actions.edit')}</span>
            </Tooltip>
          ) : (
            <Link
              key="edit"
              to={`${resolveRoute()}/${record.paramGroupId}/edit`}
            >
              {t('actions.edit')}
            </Link>
          ),
          <a
            key="copy"
            onClick={() => {
              openCopyModal(record.paramGroupId!)
            }}
          >
            {t('actions.copy')}
          </a>,
          <DeleteConfirm
            key="delete"
            title={t('delete.confirm')}
            onConfirm={async (close) => {
              await deleteAction(record.paramGroupId!)
              close()
            }}
            disabled={isBuiltIn}
          >
            {isBuiltIn ? (
              <Tooltip title={t('delete.disabled')}>
                <span className={styles.disabled}>{t('actions.delete')}</span>
              </Tooltip>
            ) : (
              <a className="danger-link">{t('actions.delete')}</a>
            )}
          </DeleteConfirm>,
        ]
      },
    },
  ]
}

function useTableColumn({
  openCopyModal,
}: {
  openCopyModal: (paramGroupId: number) => void
}) {
  const { t } = useI18n()

  const deleteAction = useDeleteParamGroupAction()

  // FIXME
  const searchHidden = useForceUpdateSearch()

  return useMemo(
    () => getColumns(t, searchHidden, deleteAction, openCopyModal),
    [searchHidden, deleteAction, openCopyModal]
  )
}

function useFetchParamGroupData() {
  const [pagination, setPagination] = usePagination()
  const [filters, setFilter] = useState<{
    name?: string
    type?: ParamGroupCreationType
    dbType?: ParamGroupDBType
    dbVersion?: string
  }>({
    name: undefined,
    type: undefined,
    dbType: undefined,
    dbVersion: undefined,
  })
  const { data, isLoading, isPreviousData, refetch } = useQueryParamGroupList(
    {
      ...pagination,
      name: filters.name,
      dbType: filters.dbType,
      dbVersion: filters.dbVersion,
      creationType: filters.type,
    },
    { keepPreviousData: true }
  )

  const result = data?.data as PagedResult | undefined

  return {
    pagination,
    setPagination,
    data: data?.data.data,
    totalPage: result?.page?.total ?? 0,
    isPreviousData,
    setFilter,
    isLoading,
    refetch,
  }
}

export default function ParamGroupTable() {
  const {
    data,
    totalPage,
    isLoading,
    isPreviousData,
    setPagination,
    pagination,
    setFilter,
    refetch,
  } = useFetchParamGroupData()

  const {
    onOpen: openCopyModal,
    onClose: closeCopyModal,
    visible: copyModalVisible,
    copyData,
    copyAction,
  } = useCopyModal(data)

  const columns = useTableColumn({
    openCopyModal,
  })

  return (
    <>
      <HeavyTable
        loading={isLoading}
        dataSource={data || []}
        className={styles.paramGroupTable}
        headerTitle={null}
        onSubmit={(filters: any) => {
          setFilter(filters as any)
        }}
        tooltip={false}
        columns={columns}
        pagination={{
          pageSize: pagination.pageSize,
          current: pagination.page,
          total: totalPage,
          onChange(page, pageSize) {
            if (!isPreviousData)
              setPagination({ page, pageSize: pageSize || pagination.pageSize })
          },
        }}
        rowKey="paramGroupId"
        search={{
          filterType: 'light',
        }}
        columnsState={{
          persistenceKey: 'param-group-table-show',
          defaultValue: defaultColumnsSetting,
        }}
        options={{
          reload: () => refetch(),
        }}
      />
      <ParamGroupCopyModal
        dataSource={copyData}
        visible={copyModalVisible}
        onConfirm={copyAction}
        onCancel={closeCopyModal}
      />
    </>
  )
}

const defaultColumnsSetting: Record<string, ColumnsState> = {
  actions: { fixed: 'right' },
}
