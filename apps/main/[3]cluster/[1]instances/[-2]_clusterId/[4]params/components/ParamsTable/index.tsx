import { ClusterInfo } from '@/api/model'
import { loadI18n } from '@i18n-macro'

loadI18n()

export interface ParamsTableProps {
  cluster: ClusterInfo
}

export function ParamsTable({ cluster }: ParamsTableProps) {
  return <>{cluster.clusterId}</>
}
