import { AxiosError } from 'axios'
import { useErrorNotification } from '@/components/ErrorNotification'

export const onErrorResponse = (error: AxiosError): Promise<AxiosError> => {
  if (!error.config.skipInterceptors) {
    useErrorNotification(error)
  }
  return Promise.reject(error)
}
