// @ts-ignore
import { AxiosRequestConfig } from 'axios' // eslint-disable-line

declare module 'axios' {
  interface AxiosRequestConfig {
    // skip onSuccess and onError interceptors
    skipInterceptors?: boolean
    // the action name displayed in notification
    actionName?: string
  }
}
