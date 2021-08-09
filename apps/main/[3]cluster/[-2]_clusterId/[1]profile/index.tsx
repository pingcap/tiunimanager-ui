import { useClusterContext } from '@apps/main/[3]cluster/[-2]_clusterId/context'
import { Badge, Card, Col, Descriptions, Row } from 'antd'
import styles from './index.module.less'
import { useMemo } from 'react'
import { CopyIconButton } from '@/components/CopyToClipboard'
import { formatTimeString } from '@/utils/time'
import { BigUsageCircle } from '@/components/UsageCircle'
import { Desc } from './components/Desc'
import { Usage } from '@apps/main/[3]cluster/[-2]_clusterId/[1]profile/components/Usage'

export default function () {
  const cluster = useClusterContext()
  return useMemo(
    () => (
      <div>
        <Desc cluster={cluster} />
        <Usage cluster={cluster} />
      </div>
    ),
    [cluster]
  )
}
