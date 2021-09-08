import { loadI18n } from '@i18n-macro'
import { ExternalService } from '@/components/ExternalService'

loadI18n()

export default function () {
  return <ExternalService src={import.meta.env.VITE_TIDB_MONITOR_URL} />
}
