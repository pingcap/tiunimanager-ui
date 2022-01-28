import { FC, useCallback } from 'react'
import { useQueryClient } from 'react-query'
import { loadI18n, useI18n } from '@i18n-macro'
import { ClusterDataReplicationDownstreamType } from '@/api/model'
import {
  invalidateClusterDataReplicationList,
  useCreateClusterDataReplication,
} from '@/api/hooks/cluster'
import { EditSumbitValues } from '../../../components/ReplicationEdit/helper'
import EditBlock from '../../../components/ReplicationEdit/EditBlock'

loadI18n()

interface CreationPanelProps {
  clusterId: string
  back: () => void
}

const CreationPanel: FC<CreationPanelProps> = ({ clusterId, back }) => {
  const { t, i18n } = useI18n()

  const queryClient = useQueryClient()

  const createDataReplication = useCreateClusterDataReplication()

  const onFinish = useCallback(
    async (fields: EditSumbitValues) => {
      try {
        await createDataReplication.mutateAsync({
          payload: {
            clusterId,
            name: fields.name,
            startTS: fields.tso,
            rules: fields.filterRuleList?.filter((el) => el),
            downstreamType: fields.downstreamType as any,
            downstream: fields.downstream,
          },
          options: {
            successMessage: t('message.success'),
            errorMessage: t('message.failed'),
          },
        })

        back()
      } finally {
        invalidateClusterDataReplicationList(queryClient)
      }
    },
    [i18n.language, queryClient, createDataReplication, clusterId]
  )

  return (
    <EditBlock
      mode="new"
      initialValues={{
        tso: '0',
        downstreamType: ClusterDataReplicationDownstreamType.tidb,
        downstream: {
          mysql: {
            concurrentThreads: 16,
          },
          tidb: {
            concurrentThreads: 16,
          },
        },
      }}
      onEditSubmit={onFinish}
    />
  )
}

export default CreationPanel
