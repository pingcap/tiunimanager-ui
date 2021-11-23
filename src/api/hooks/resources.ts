import { APIS, basePath, PartialUseQueryOptions } from '@/api/client'
import { QueryClient, useMutation, useQuery } from 'react-query'
import { HardwareArch, ResourceUnitType } from '@/api/model'

export const CACHE_HOSTS_LIST_KEY = 'resources-hosts-list'
export const CACHE_HOST_DETAIL_KEY = 'resources-host-detail'
export const CACHE_FAILURE_DOMAIN_KEY = 'resources-failure-domains'
export const CACHE_HIERARCHY_KEY = 'resources-hierarchy'

export function useQueryHostsList(
  query: {
    page?: number
    pageSize?: number
    purpose?: string
    status?: number
    loadStat?: number
  },
  options?: PartialUseQueryOptions
) {
  const { page, pageSize, purpose, status, loadStat } = query
  return useQuery(
    [CACHE_HOSTS_LIST_KEY, status, loadStat, purpose, page, pageSize],
    () =>
      APIS.Resources.resourcesHostsGet(
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

export function useQueryHostDetail(
  query: {
    hostId: string
  },
  options?: PartialUseQueryOptions
) {
  const { hostId } = query
  return useQuery(
    [CACHE_HOST_DETAIL_KEY, hostId],
    () => APIS.Resources.resourcesHostsHostIdGet(hostId),
    options
  )
}

export async function invalidateHostDetail(
  client: QueryClient,
  hostId: string
) {
  await client.invalidateQueries([CACHE_HOST_DETAIL_KEY, hostId])
}

export function useQueryFailureDomains(
  query: {
    type?: 1 | 2 | 3
  },
  options?: PartialUseQueryOptions
) {
  const { type } = query
  return useQuery(
    [CACHE_FAILURE_DOMAIN_KEY, type],
    () => APIS.Resources.resourcesFailuredomainsGet(type),
    options
  )
}

export async function invalidateFailureDomains(client: QueryClient) {
  await client.invalidateQueries(CACHE_FAILURE_DOMAIN_KEY)
}

const deleteHosts = (payload: { hostsId: string | string[] }) => {
  return Array.isArray(payload.hostsId)
    ? APIS.Resources.resourcesHostsDelete(payload.hostsId)
    : APIS.Resources.resourcesHostsHostIdDelete(payload.hostsId)
}

export function useDeleteHosts() {
  return useMutation(deleteHosts)
}

export function getHostsTemplateURL() {
  return basePath + '/resources/hosts-template/'
}

export function getHostsUploadURL() {
  return basePath + '/resources/hosts'
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
