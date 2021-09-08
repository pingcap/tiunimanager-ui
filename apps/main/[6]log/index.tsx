import { ExternalService } from '@/components/ExternalService'

export default function () {
  return <ExternalService src={import.meta.env.VITE_LOG_URL} />
}
