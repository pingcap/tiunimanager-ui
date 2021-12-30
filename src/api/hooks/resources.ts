import { APIS, apiBasePath } from '@/api/client'
import { QueryClient, useMutation, useQuery } from 'react-query'
import { HardwareArch, ResourceUnitType } from '@/api/model'
import { AxiosRequestConfig } from 'axios'
import { PartialUseQueryOptions, withRequestOptions } from './utils'

export const CACHE_HOSTS_LIST_KEY = 'resources-hosts-list'
export const CACHE_HOST_DETAIL_KEY = 'resources-host-detail'
export const CACHE_HIERARCHY_KEY = 'resources-hierarchy'

export function useQueryHostsList(
  query: {
    arch?: string
    hostId?: string
    page?: number
    pageSize?: number
    purpose?: string
    status?: string
    loadStat?: string
  },
  options?: PartialUseQueryOptions
) {
  const { arch, hostId, page, pageSize, purpose, status, loadStat } = query
  return useQuery(
    [
      CACHE_HOSTS_LIST_KEY,
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
        loadStat,
        page,
        pageSize,
        purpose,
        status
      ),
    options
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

const deleteHosts = withRequestOptions(
  (payload: { hostsId: string | string[] }, options?: AxiosRequestConfig) => {
    return APIS.Resources.resourcesHostsDelete(
      {
        hostIds: Array.isArray(payload.hostsId)
          ? payload.hostsId
          : [payload.hostsId],
      },
      options
    )
  }
)

export function useDeleteHosts() {
  return useMutation(deleteHosts)
}

export function getHostsTemplateURL() {
  return apiBasePath + '/resources/hosts-template/'
}

export function getHostsUploadURL() {
  return apiBasePath + '/resources/hosts'
}

export function useQueryResourceHierarchy(
  query: {
    type: ResourceUnitType
    depth: number
    arch?: HardwareArch
  },
  options?: PartialUseQueryOptions
) {
  const { type, depth, arch } = query
  return useQuery(
    [CACHE_HIERARCHY_KEY, type, depth, arch],
    () => APIS.Resources.resourcesHierarchyGet(type, depth, arch),
    options
  )
}
