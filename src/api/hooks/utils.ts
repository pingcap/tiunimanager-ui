/*
 * Copyright 2022 PingCAP
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
