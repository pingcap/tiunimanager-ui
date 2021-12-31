import { AxiosRequestConfig } from 'axios'
import { UseQueryOptions } from 'react-query'

export function withRequestOptions<P, R>(
  fn: (payload: P, options?: AxiosRequestConfig) => R
): (payload: P & { options?: AxiosRequestConfig }) => R {
  return ({ options, ...payload }) => fn(payload as any, options)
}

export type PartialUseQueryOptions = Pick<
  UseQueryOptions,
  | 'cacheTime'
  | 'enabled'
  | 'staleTime'
  | 'keepPreviousData'
  | 'suspense'
  | 'refetchInterval'
  | 'refetchIntervalInBackground'
  | 'refetchOnWindowFocus'
  | 'refetchOnReconnect'
  | 'refetchOnMount'
  | 'retryOnMount'
>
