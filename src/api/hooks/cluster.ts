import { QueryClient, useMutation, useQuery } from 'react-query'
import { APIS, PartialUseQueryOptions } from '@/api/client'
import {
  RequestBackupCreate,
  RequestBackupRestore,
  RequestBackupStrategyUpdate,
  RequestTransportExport,
  RequestTransportImport,
  RequestClusterCreate,
  RequestClusterParamsUpdate,
} from '@/api/model'

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

const deleteCluster = (payload: { id: string }) =>
  APIS.Clusters.clustersClusterIdDelete(payload.id)

export function useDeleteCluster() {
  return useMutation(deleteCluster)
}

const createCluster = (payload: RequestClusterCreate) =>
  APIS.Clusters.clustersPost(payload)

export function useCreateCluster() {
  return useMutation(createCluster)
}

const rebootCluster = (payload: { id: string }) =>
  APIS.Clusters.clustersClusterIdRestartPost(payload.id)

export function useRebootCluster() {
  return useMutation(rebootCluster)
}

const stopCluster = (payload: { id: string }) =>
  APIS.Clusters.clustersClusterIdStopPost(payload.id)

export function useStopCluster() {
  return useMutation(stopCluster)
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

const updateClusterParams = ({
  clusterId,
  ...payload
}: RequestClusterParamsUpdate & { clusterId: string }) =>
  APIS.ClusterParams.clustersClusterIdParamsPost(clusterId, payload)

export function useUpdateClusterParams() {
  return useMutation(updateClusterParams)
}

/**
 * Cluster Logs
 */

export const CACHE_CLUSTER_LOGS = 'cluster-logs'

export type UseQueryClusterLogsParams = {
  clusterId: string
  endTime?: string
  page?: number
  ip?: string
  level?: string
  message?: string
  module?: string
  pageSize?: number
  startTime?: string
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
      APIS.Logs.logsTidbClusterIdGet(
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

const updateClusterBackupStrategy = ({
  clusterId,
  ...payload
}: RequestBackupStrategyUpdate & { clusterId: string }) =>
  APIS.ClusterBackups.clustersClusterIdStrategyPut(clusterId, payload)

export function useUpdateClusterBackupStrategy() {
  return useMutation(updateClusterBackupStrategy)
}

export function useQueryClusterBackups(
  query: {
    id: string
    page?: number
    pageSize?: number
    startTime?: number
    endTime?: number
  },
  options?: PartialUseQueryOptions
) {
  const { id, page, pageSize, startTime, endTime } = query
  return useQuery(
    [CACHE_CLUSTER_BACKUPS, id, page, pageSize, startTime, endTime],
    () =>
      APIS.ClusterBackups.backupsGet(id, endTime, page, pageSize, startTime),
    options
  )
}

export async function invalidateClusterBackups(
  client: QueryClient,
  clusterId: string
) {
  await client.invalidateQueries([CACHE_CLUSTER_BACKUPS, clusterId])
}

const deleteClusterBackup = (payload: {
  backupId: number
  clusterId: string
}) =>
  APIS.ClusterBackups.backupsBackupIdDelete(payload.backupId, {
    clusterId: payload.clusterId,
  })

export function useDeleteClusterBackup() {
  return useMutation(deleteClusterBackup)
}

const createClusterBackup = (payload: RequestBackupCreate) =>
  APIS.ClusterBackups.backupsPost(payload)

export function useCreateClusterBackup() {
  return useMutation(createClusterBackup)
}

const restoreClusterBackup = (payload: RequestBackupRestore) =>
  APIS.Clusters.clustersRestorePost(payload)

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
 * Cluster Import/Export
 */

const importCluster = (payload: RequestTransportImport) =>
  APIS.ClustersImport.clustersImportPost(payload)

export function useImportCluster() {
  return useMutation(importCluster)
}

const exportCluster = (payload: RequestTransportExport) =>
  APIS.ClustersExport.clustersExportPost(payload)

export function useExportCluster() {
  return useMutation(exportCluster)
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
