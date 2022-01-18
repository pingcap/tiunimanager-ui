import { FC, useCallback } from 'react'
import { useQueryClient } from 'react-query'
import { loadI18n, useI18n } from '@i18n-macro'
import { Spin } from 'antd'
import {
  invalidateClusterDataReplicationList,
  useQueryClusterDataReplicationDetail,
  useUpdateClusterDataReplication,
} from '@/api/hooks/cluster'
import EditBlock from '../../../../components/ReplicationEdit/EditBlock'
import { EditSumbitValues } from '../../../../components/ReplicationEdit/helper'

loadI18n()

const useFetchReplicationDetail = ({ taskId }: { taskId: string }) => {
  const { data, isLoading } = useQueryClusterDataReplicationDetail(
    {
      id: taskId,
    },
    {
      refetchOnWindowFocus: false,
      enabled: !!taskId,
    }
  )
  const result = data?.data.data

  return {
    data: result,
    isLoading,
  }
}

interface EditingPanelProps {
  taskId: string
  back: () => void
}

const EditingPanel: FC<EditingPanelProps> = ({ taskId, back }) => {
  const { t, i18n } = useI18n()

  const { data: dataSource, isLoading } = useFetchReplicationDetail({ taskId })

  const queryClient = useQueryClient()

  const updateDataReplication = useUpdateClusterDataReplication()

  const onFinish = useCallback(
    async (fields: EditSumbitValues) => {
      try {
        await updateDataReplication.mutateAsync({
          payload: {
            id: taskId,
            name: fields.name,
            rules: fields.filterRuleList?.filter((el) => el),
            downstreamType: fields.downstreamType as any,
            downstream: fields.downstream,
          },
          options: {
            actionName: t('message.name'),
          },
        })

        back()
      } finally {
        invalidateClusterDataReplicationList(queryClient)
      }
    },
    [i18n.language, queryClient, updateDataReplication, taskId]
  )

  if (isLoading || !dataSource) {
    return <Spin />
  }

  return (
    <EditBlock
      mode="edit"
      staticData={{ taskId: taskId }}
      initialValues={{
        name: dataSource.name,
        tso: dataSource.startTS,
        filterRuleList: dataSource.rules,
        downstreamType: dataSource.downstreamType as any,
        downstream: {
          [dataSource.downstreamType!]: {
            ...dataSource.downstream,
            ip: (dataSource.downstream as any)?.ip?.replace(/^https?:\/\//, ''),
          },
        },
      }}
      onEditSubmit={onFinish}
    />
  )
}

export default EditingPanel
