import { ExternalService } from '@/components/ExternalService'
import { getEnvState } from '@store/env'

export default function () {
  return <ExternalService src={getEnvState().service.tracer || ''} />
}
