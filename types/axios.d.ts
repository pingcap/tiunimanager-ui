// @ts-ignore
import { AxiosRequestConfig } from 'axios' // eslint-disable-line

declare module 'axios' {
  interface AxiosRequestConfig {
    // skip success and error notifications
    skipNotifications?: boolean
    // skip error notification
    skipErrorNotification?: boolean
    // skip success notification
    skipSuccessNotification?: boolean
    // Deprecated. the action name displayed in notification
    actionName?: string
    // the message displayed in the success notification
    successMessage?: string
    // the message displayed in the error notification
    errorMessage?: string

    // Request ID
    requestId?: number
  }
}
