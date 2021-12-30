import { FC } from 'react'
import { Spin } from 'antd'
import { useQueryClusterDataReplicationDetail } from '@/api/hooks/cluster'

import styles from './index.module.less'

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

interface DetailPanelProps {
  taskId: string
}

const DetailPanel: FC<DetailPanelProps> = ({ taskId }) => {
  const { isLoading } = useFetchReplicationDetail({ taskId })

  if (isLoading) {
    return <Spin />
  }

  return <div className={styles.detailPanel}>id: {taskId}</div>
}

export default DetailPanel
