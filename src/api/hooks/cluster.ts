import { QueryClient, useMutation, useQuery } from 'react-query'
import { APIS } from '@/api/client'
import {
  RequestBackupCreate,
  RequestBackupRestore,
  RequestBackupStrategyUpdate,
  RequestClusterCreate,
  RequestClusterParamsUpdate,
  RequestClusterScaleIn,
  RequestClusterScaleOut,
  RequestClusterTakeover,
} from '@/api/model'
import { AxiosRequestConfig } from 'axios'
import { withRequestOptions, PartialUseQueryOptions } from '@/api/hooks/utils'

/**
 * Clusters
 */

export const CACHE_CLUSTERS_LIST_KEY = 'clusters-list'
export const CACHE_CLUSTER_DETAIL_KEY = 'cluster-detail'

export function useQueryClustersList(
  query: {
    id?: string
    name?: string
    status?: string
    tag?: string
    type?: string
    page?: number
    pageSize?: number
  },
  options?: PartialUseQueryOptions
) {
  const { id, name, status, tag, type, page, pageSize } = query
  return useQuery(
    [CACHE_CLUSTERS_LIST_KEY, page, pageSize, status, type, tag, name, id],
    () =>
      APIS.Clusters.clustersGet(id, name, status, tag, type, page, pageSize),
    options
  )
}

export async function invalidateClustersList(client: QueryClient) {
  await client.invalidateQueries(CACHE_CLUSTERS_LIST_KEY)
}

export function useQueryClusterDetail(
  query: { id: string },
  options?: PartialUseQueryOptions
) {
  const { id } = query
  return useQuery(
    [CACHE_CLUSTER_DETAIL_KEY, id],
    () => APIS.Clusters.clustersClusterIdGet(id),
    options
  )
}

export async function invalidateClusterDetail(client: QueryClient, id: string) {
  await client.invalidateQueries([CACHE_CLUSTER_DETAIL_KEY, id])
}

const deleteCluster = ({
  payload,
  options,
}: {
  payload: {
    id: string
    autoBackup: boolean
    keepExistingBackupData: boolean
    force?: boolean
  }
  options?: AxiosRequestConfig
}) =>
  APIS.Clusters.clustersClusterIdDelete(
    payload.id,
    {
      autoBackup: payload.autoBackup,
      keepHistoryBackupRecords: payload.keepExistingBackupData,
      force: payload.force,
    },
    options
  )

export function useDeleteCluster() {
  return useMutation(deleteCluster)
}

const createCluster = withRequestOptions(
  (payload: RequestClusterCreate, options?: AxiosRequestConfig) =>
    APIS.Clusters.clustersPost(payload, options)
)

export function useCreateCluster() {
  return useMutation(createCluster)
}

const rebootCluster = withRequestOptions(
  (payload: { id: string }, options?: AxiosRequestConfig) =>
    APIS.Clusters.clustersClusterIdRestartPost(payload.id, options)
)

export function useRebootCluster() {
  return useMutation(rebootCluster)
}

const stopCluster = withRequestOptions(
  (payload: { id: string }, options?: AxiosRequestConfig) =>
    APIS.Clusters.clustersClusterIdStopPost(payload.id, options)
)

export function useStopCluster() {
  return useMutation(stopCluster)
}

const previewCreateCluster = withRequestOptions(
  (payload: RequestClusterCreate, options?: AxiosRequestConfig) =>
    APIS.Clusters.clustersPreviewPost(payload, options)
)

export function usePreviewCreateCluster() {
  return useMutation(previewCreateCluster)
}

/**
 * Cluster Params
 */

export const CACHE_CLUSTER_PARAMS = 'cluster-params'

export function useQueryClusterParams(
  query: {
    id: string
    page?: number
    pageSize?: number
  },
  options?: PartialUseQueryOptions
) {
  const { id, page, pageSize } = query
  return useQuery(
    [CACHE_CLUSTER_PARAMS, id, page, pageSize],
    () => APIS.ClusterParams.clustersClusterIdParamsGet(id, page, pageSize),
    options
  )
}

export async function invalidateClusterParams(
  client: QueryClient,
  clusterId: string
) {
  await client.invalidateQueries([CACHE_CLUSTER_PARAMS, clusterId])
}

const updateClusterParams = withRequestOptions(
  (
    {
      clusterId,
      ...payload
    }: RequestClusterParamsUpdate & { clusterId: string },
    options?: AxiosRequestConfig
  ) =>
    APIS.ClusterParams.clustersClusterIdParamsPut(clusterId, payload, options)
)

export function useUpdateClusterParams() {
  return useMutation(updateClusterParams)
}

/**
 * Cluster Logs
 */

export const CACHE_CLUSTER_LOGS = 'cluster-logs'

export type UseQueryClusterLogsParams = {
  clusterId: string
  endTime?: number
  page?: number
  ip?: string
  level?: string
  message?: string
  module?: string
  pageSize?: number
  startTime?: number
}

export function useQueryClusterLogs(
  query: UseQueryClusterLogsParams,
  options?: PartialUseQueryOptions
) {
  const {
    clusterId,
    startTime,
    endTime,
    page,
    ip,
    pageSize,
    message,
    module,
    level,
  } = query
  return useQuery(
    [
      CACHE_CLUSTER_LOGS,
      clusterId,
      startTime,
      endTime,
      level,
      ip,
      page,
      pageSize,
      message,
      module,
    ],
    () =>
      APIS.Logs.clustersClusterIdLogGet(
        clusterId,
        endTime,
        ip,
        level,
        message,
        module,
        page,
        pageSize,
        startTime
      ),
    options
  )
}

/**
 * Cluster Backups
 */

export const CACHE_CLUSTER_BACKUPS = 'cluster-backups'
export const CACHE_CLUSTER_BACKUP_STRATEGY = 'cluster-backup-strategy'

export function useQueryClusterBackupStrategy(
  query: {
    id: string
  },
  options?: PartialUseQueryOptions
) {
  const { id } = query
  return useQuery(
    [CACHE_CLUSTER_BACKUP_STRATEGY, id],
    () => APIS.ClusterBackups.clustersClusterIdStrategyGet(id),
    options
  )
}

export async function invalidateClusterBackupStrategy(
  client: QueryClient,
  clusterId: string
) {
  await client.invalidateQueries([CACHE_CLUSTER_BACKUP_STRATEGY, clusterId])
}

const updateClusterBackupStrategy = withRequestOptions(
  (
    {
      clusterId,
      ...payload
    }: RequestBackupStrategyUpdate & { clusterId: string },
    options?: AxiosRequestConfig
  ) =>
    APIS.ClusterBackups.clustersClusterIdStrategyPut(
      clusterId,
      payload,
      options
    )
)

export function useUpdateClusterBackupStrategy() {
  return useMutation(updateClusterBackupStrategy)
}

export function useQueryClusterBackups(
  query: {
    clusterId: string
    page?: number
    pageSize?: number
    startTime?: number
    endTime?: number
  },
  options?: PartialUseQueryOptions
) {
  const { clusterId, page, pageSize, startTime, endTime } = query
  return useQuery(
    [CACHE_CLUSTER_BACKUPS, clusterId, page, pageSize, startTime, endTime],
    () =>
      APIS.ClusterBackups.backupsGet(
        undefined,
        clusterId,
        endTime,
        page,
        pageSize,
        startTime
      ),
    options
  )
}

export async function invalidateClusterBackups(
  client: QueryClient,
  clusterId: string
) {
  await client.invalidateQueries([CACHE_CLUSTER_BACKUPS, clusterId])
}

const deleteClusterBackup = withRequestOptions(
  (
    payload: {
      backupId: number
      clusterId: string
    },
    options?: AxiosRequestConfig
  ) =>
    APIS.ClusterBackups.backupsBackupIdDelete(
      payload.backupId,
      {
        clusterId: payload.clusterId,
      },
      options
    )
)

export function useDeleteClusterBackup() {
  return useMutation(deleteClusterBackup)
}

const createClusterBackup = withRequestOptions(
  (payload: RequestBackupCreate, options?: AxiosRequestConfig) =>
    APIS.ClusterBackups.backupsPost(payload, options)
)

export function useCreateClusterBackup() {
  return useMutation(createClusterBackup)
}

const restoreClusterBackup = withRequestOptions(
  (payload: RequestBackupRestore, options?: AxiosRequestConfig) =>
    APIS.Clusters.clustersRestorePost(payload, options)
)

export function useRestoreClusterBackup() {
  return useMutation(restoreClusterBackup)
}

/**
 * Cluster Dashboard
 */

const CACHE_CLUSTER_DASHBOARD = 'cluster-dashboard'

export function useQueryClusterDashboard(
  query: {
    id: string
  },
  options?: PartialUseQueryOptions
) {
  const { id } = query
  return useQuery(
    [CACHE_CLUSTER_DASHBOARD, id],
    () => APIS.Clusters.clustersClusterIdDashboardGet(id),
    options
  )
}

/**
 * Cluster External Services
 */

const CACHE_CLUSTER_EXTERNAL_SERVICE = 'cluster-external-service'

export function useQueryClusterExternalService(
  query: {
    id: string
  },
  options?: PartialUseQueryOptions
) {
  const { id } = query
  return useQuery(
    [CACHE_CLUSTER_EXTERNAL_SERVICE, id],
    () => APIS.Clusters.clustersClusterIdMonitorGet(id),
    {
      cacheTime: 1000 * 60 * 60,
      staleTime: 1000 * 60 * 60,
      refetchOnWindowFocus: false,
      ...options,
    }
  )
}

/**
 * Cluster Scaling
 */

const scaleOutCluster = withRequestOptions(
  (
    {
      clusterId,
      ...payload
    }: RequestClusterScaleOut & {
      clusterId: string
    },
    options?: AxiosRequestConfig
  ) => APIS.Clusters.clustersClusterIdScaleOutPost(clusterId, payload, options)
)

export function useClusterScaleOut() {
  return useMutation(scaleOutCluster)
}

const previewScaleOutCluster = withRequestOptions(
  (
    { id, ...payload }: RequestClusterScaleOut & { id: string },
    options?: AxiosRequestConfig
  ) => APIS.Clusters.clustersClusterIdPreviewScaleOutGet(id, payload, options)
)

export function usePreviewScaleOutCluster() {
  return useMutation(previewScaleOutCluster)
}

const scaleInCluster = withRequestOptions(
  (
    {
      clusterId,
      ...payload
    }: RequestClusterScaleIn & {
      clusterId: string
    },
    options?: AxiosRequestConfig
  ) => APIS.Clusters.clustersClusterIdScaleInPost(clusterId, payload, options)
)

export function useClusterScaleIn() {
  return useMutation(scaleInCluster)
}

/**
 * Cluster Taking Over
 */

const takeOverCluster = withRequestOptions(
  (payload: RequestClusterTakeover, options?: AxiosRequestConfig) =>
    APIS.Clusters.clustersTakeoverPost(payload, options)
)

export function useClusterTakeover() {
  return useMutation(takeOverCluster)
}
