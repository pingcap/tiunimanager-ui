// @ts-ignore
import { AxiosRequestConfig } from 'axios' // eslint-disable-line

declare module 'axios' {
  interface AxiosRequestConfig {
    skipInterceptors?: boolean
  }
}
