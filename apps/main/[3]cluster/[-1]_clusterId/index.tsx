import { useClusterContext } from '@apps/main/[3]cluster/[-1]_clusterId/context'
import { Card, Col, Progress, Row } from 'antd'
import { ControllerUsage } from '#/api'
import styles from './index.module.less'

function getUsageCard(
  name: string,
  unit: string,
  usage?: Required<ControllerUsage>
) {
  if (!usage) {
    return (
      <Card
        className={styles.usageCard}
        bordered={false}
        cover={
          <Progress
            type="circle"
            width={120}
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
  const { usageRate, used, total } = usage
  return (
    <Card
      className={styles.usageCard}
      bordered={false}
      cover={
        <Progress
          type="circle"
          width={120}
          percent={usageRate * 100}
          size="small"
          format={() => `${usageRate * 100} %`}
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

export default function () {
  const cluster = useClusterContext()
  return (
    <div>
      <Card title="资源使用情况" bordered={false}>
        <Row>
          <Col span={4}>
            {getUsageCard(
              'CPU',
              '',
              cluster!.cpuUsage! as Required<ControllerUsage>
            )}
          </Col>
          <Col span={4} offset={1}>
            {getUsageCard(
              '内存',
              'MB',
              cluster!.memoryUsage! as Required<ControllerUsage>
            )}
          </Col>
          <Col span={4} offset={1}>
            {getUsageCard(
              '磁盘',
              'MB',
              cluster!.diskUsage! as Required<ControllerUsage>
            )}
          </Col>
          <Col span={4} offset={1}>
            {getUsageCard(
              '存储',
              'MB',
              cluster!.storageUsage! as Required<ControllerUsage>
            )}
          </Col>
          <Col span={4} offset={1}>
            {getUsageCard(
              '备份',
              'MB',
              cluster!.backupFileUsage! as Required<ControllerUsage>
            )}
          </Col>
        </Row>
      </Card>
    </div>
  )
}
