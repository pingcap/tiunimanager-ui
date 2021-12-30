import { AxiosError, AxiosResponse } from 'axios'
import { useErrorNotification } from '@/components/ErrorNotification'
import { useSuccessNotification } from '@/components/SuccessNotification'

// for all 4xx, 5xx responses
export const onErrorResponse = (error: AxiosError) => {
  if (!error.config.skipInterceptors) {
    useErrorNotification(error)
  }
  return Promise.reject(error)
}

// for responses to non-GET requests
export const onSuccessResponse = (resp: AxiosResponse) => {
  if (resp.config.method !== 'get' && !resp.config.skipInterceptors) {
    useSuccessNotification(resp)
  }
  return resp
}
