import { AxiosError, AxiosResponse } from 'axios'
import { useErrorNotification } from '@/components/ErrorNotification'
import { useSuccessNotification } from '@/components/SuccessNotification'
import { getAuthState } from '@store/auth'

// for all 4xx, 5xx responses
export const onErrorResponse = (error: AxiosError) => {
  if (!error.config.skipNotification) {
    useErrorNotification(error)
  }
  if (error.response?.status === 401) {
    getAuthState().logout()
  }
  return Promise.reject(error)
}

// for responses to non-GET requests
export const onSuccessResponse = (resp: AxiosResponse) => {
  if (resp.config.method !== 'get' && !resp.config.skipNotification) {
    useSuccessNotification(resp)
  }
  return resp
}
