import { AxiosError, AxiosResponse } from 'axios'
import { useErrorNotification } from '@/components/ErrorNotification'
import { useSuccessNotification } from '@/components/SuccessNotification'
import { getAuthState } from '@store/auth'

// for all 4xx, 5xx responses
export const onErrorResponse = (error: AxiosError) => {
  if (!error.config.skipNotifications && !error.config.skipErrorNotification) {
    useErrorNotification(error)
  }

  if (error.response?.status === 401) {
    getAuthState().logout()
  } else if (
    error.response?.status === 400 &&
    error.response?.data?.code === 70615
  ) {
    getAuthState().resetPasswordExpired()
  }

  return Promise.reject(error)
}

// for responses to non-GET requests
export const onSuccessResponse = (resp: AxiosResponse) => {
  if (
    resp.config.method !== 'get' &&
    !resp.config.skipNotifications &&
    !resp.config.skipSuccessNotification
  ) {
    useSuccessNotification(resp)
  }
  return resp
}
