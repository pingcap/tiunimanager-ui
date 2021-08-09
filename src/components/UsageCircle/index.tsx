import { Card, Progress, Tooltip } from 'antd'
import styles from '@apps/main/[3]cluster/[-2]_clusterId/[1]profile/index.module.less'

export type SmallUsageCircleProps = {
  total: number
  usageRate: number
  used: number
  name: string
  unit: string
  width?: number
}

export function SmallUsageCircle({
  total,
  usageRate,
  used,
  name,
  unit,
  width,
}: SmallUsageCircleProps) {
  const percent = usageRate * 100
  return (
    <Tooltip title={`${used} / ${total} ${unit}, ${percent.toFixed(2)}%`}>
      <Progress
        type="circle"
        width={width || 40}
        percent={percent}
        size="small"
        format={() => name}
        status={
          usageRate > 0.8 ? 'exception' : usageRate > 0.4 ? 'normal' : 'success'
        }
      />
    </Tooltip>
  )
}

export type BigUsageCircleProps = {
  total?: number
  usageRate?: number
  used?: number
  name: string
  unit: string
  width?: number
  className?: string
}

export function BigUsageCircle({
  total,
  usageRate,
  used,
  name,
  unit,
  width,
  className,
}: BigUsageCircleProps) {
  if (used === undefined || usageRate === undefined || total === undefined) {
    return (
      <Card
        className={styles.usageCard}
        bordered={false}
        cover={
          <Progress
            type="circle"
            width={width || 120}
            percent={0}
            size="small"
            format={() => 'unknown'}
            status="normal"
          />
        }
      >
        <Card.Meta title={name} description="unknown" />
      </Card>
    )
  }
  const percent = usageRate * 100
  return (
    <Card
      className={className}
      bordered={false}
      cover={
        <Progress
          type="circle"
          width={width || 120}
          percent={percent}
          size="small"
          format={() => `${percent.toFixed(2)}%`}
          status={
            usageRate > 0.8
              ? 'exception'
              : usageRate > 0.4
              ? 'normal'
              : 'success'
          }
        />
      }
    >
      <Card.Meta title={name} description={`${used} / ${total} ${unit}`} />
    </Card>
  )
}
