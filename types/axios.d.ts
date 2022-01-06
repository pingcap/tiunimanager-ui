// @ts-ignore
import { AxiosRequestConfig } from 'axios' // eslint-disable-line

declare module 'axios' {
  interface AxiosRequestConfig {
    // skip success and error notifications
    skipNotification?: boolean
    // the action name displayed in notification
    actionName?: string
  }
}
