import { AxiosRequestConfig } from 'axios'
import { UseQueryOptions } from 'react-query'

let nextId = 0

export function withRequestId<R>(fn: (requestId: number) => R): R {
  if (nextId === Number.MAX_SAFE_INTEGER) nextId = 0
  const requestId = nextId++
  return fn(requestId)
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

export type PayloadWithOptions<P> = {
  payload: P
  options?: AxiosRequestConfig
}

export type Paged<T> = T & {
  pageSize?: number
  page?: number
}
