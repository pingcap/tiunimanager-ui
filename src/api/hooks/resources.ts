/*
 * Copyright 2022 PingCAP, Inc.
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

import { apiBasePath, APIS } from '@/api/client'
import { QueryClient, useMutation, useQuery } from 'react-query'
import { HardwareArch, ResourceUnitType } from '@/api/model'
import {
  Paged,
  PartialUseQueryOptions,
  PayloadWithOptions,
  withRequestId,
} from './utils'

export const CACHE_HOSTS_LIST_KEY = 'resources-hosts-list'
export const CACHE_HOST_DETAIL_KEY = 'resources-host-detail'
export const CACHE_HIERARCHY_KEY = 'resources-hierarchy'

export type QueryHostsListParams = Paged<{
  region?: string
  arch?: string
  hostId?: string
  purpose?: string
  status?: string
  loadStat?: string

  // invisible to user
  // hostIp?: string
  // rack?: string
  // zone?: string
}>

export function useQueryHostsList(
  params: QueryHostsListParams,
  options?: PartialUseQueryOptions
) {
  const { region, arch, hostId, page, pageSize, purpose, status, loadStat } =
    params
  return withRequestId((requestId) =>
    useQuery(
      [
        CACHE_HOSTS_LIST_KEY,
        region,
        arch,
        hostId,
        status,
        loadStat,
        purpose,
        page,
        pageSize,
      ],
      () =>
        APIS.Resources.resourcesHostsGet(
          arch,
          hostId,
          undefined,
          loadStat,
          page,
          pageSize,
          purpose,
          undefined,
          region,
          status,
          undefined,
          { requestId }
        ),
      options
    )
  )
}

export async function invalidateHostsList(client: QueryClient) {
  await client.invalidateQueries(CACHE_HOSTS_LIST_KEY)
}

export async function invalidateHostDetail(
  client: QueryClient,
  hostId: string
) {
  await client.invalidateQueries([CACHE_HOST_DETAIL_KEY, hostId])
}

const deleteHosts = ({
  payload,
  options,
}: PayloadWithOptions<{ hostsId: string | string[] }>) => {
  return APIS.Resources.resourcesHostsDelete(
    {
      hostIds: Array.isArray(payload.hostsId)
        ? payload.hostsId
        : [payload.hostsId],
    },
    options
  )
}

export function useDeleteHosts() {
  return useMutation(deleteHosts)
}

export function getHostsTemplateURL() {
  return apiBasePath + '/resources/hosts-template'
}

export function getHostsUploadURL() {
  return apiBasePath + '/resources/hosts'
}

export type QueryResourceHierarchyParams = {
  type: ResourceUnitType
  depth: number
  arch?: HardwareArch
  hostId?: string
  loadStat?: string
  purpose?: string
  status?: string
}

export function useQueryResourceHierarchy(
  query: QueryResourceHierarchyParams,
  options?: PartialUseQueryOptions
) {
  const { type, depth, arch, hostId, status, loadStat, purpose } = query
  return withRequestId((requestId) =>
    useQuery(
      [
        CACHE_HIERARCHY_KEY,
        type,
        depth,
        arch,
        hostId,
        loadStat,
        purpose,
        status,
      ],
      () =>
        APIS.Resources.resourcesHierarchyGet(
          type,
          depth,
          arch,
          hostId,
          loadStat,
          purpose,
          status,
          { requestId }
        ),
      options
    )
  )
}
