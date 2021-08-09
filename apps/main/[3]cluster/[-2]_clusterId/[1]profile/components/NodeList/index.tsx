import { Card, Row } from 'antd'
import { ClusterapiDetailClusterRsp } from '#/api'
import { loadI18n, useI18n } from '@i18n-macro'

loadI18n()

export type NodeListProps = {
  cluster: ClusterapiDetailClusterRsp
}

export function NodeList({ cluster }: NodeListProps) {
  const { t } = useI18n()
  // const listDom = useMemo(() => {
  //   if (cluster.components) {
  //     cluster.components.map((c) => {})
  //   }
  // }, [cluster.components])
  return (
    <Card title={t('title')} bordered={false}>
      <Row>TBD</Row>
    </Card>
  )
}
