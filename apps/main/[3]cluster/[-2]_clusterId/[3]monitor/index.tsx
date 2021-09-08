import { ExternalService } from '@/components/ExternalService'

export default function () {
  return (
    <ExternalService src={import.meta.env.VITE_TIDB_MONITOR_URL} mode="card" />
  )
}
