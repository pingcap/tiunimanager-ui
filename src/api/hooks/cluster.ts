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
import {
  Paged,
  PartialUseQueryOptions,
  PayloadWithOptions,
  withRequestId,
} from '@/api/hooks/utils'

/**
 * Clusters
 */

export const CACHE_CLUSTERS_LIST_KEY = 'clusters-list'
export const CACHE_CLUSTER_DETAIL_KEY = 'cluster-detail'

export type QueryClustersListParams = {
  id?: string
  name?: string
  status?: string
  tag?: string
  type?: string
  page?: number
  pageSize?: number
}

export function useQueryClustersList(
  params: QueryClustersListParams,
  options?: PartialUseQueryOptions
) {
  const { id, name, status, tag, type, page, pageSize } = params
  return withRequestId((requestId) =>
    useQuery(
      [CACHE_CLUSTERS_LIST_KEY, page, pageSize, status, type, tag, name, id],
      () =>
        APIS.Clusters.clustersGet(id, name, status, tag, type, page, pageSize, {
          requestId,
        }),
      options
    )
  )
}

export async function invalidateClustersList(client: QueryClient) {
  await client.invalidateQueries(CACHE_CLUSTERS_LIST_KEY)
}

export type QueryClusterDetailParams = { id: string }

export function useQueryClusterDetail(
  params: QueryClusterDetailParams,
  options?: PartialUseQueryOptions
) {
  const { id } = params
  return withRequestId((requestId) =>
    useQuery(
      [CACHE_CLUSTER_DETAIL_KEY, id],
      () => APIS.Clusters.clustersClusterIdGet(id, { requestId }),
      options
    )
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

const createCluster = ({
  payload,
  options,
}: PayloadWithOptions<RequestClusterCreate>) =>
  APIS.Clusters.clustersPost(payload, options)

export function useCreateCluster() {
  return useMutation(createCluster)
}

const rebootCluster = ({
  payload,
  options,
}: PayloadWithOptions<{ id: string }>) =>
  APIS.Clusters.clustersClusterIdRestartPost(payload.id, options)

export function useRebootCluster() {
  return useMutation(rebootCluster)
}

const stopCluster = ({
  payload,
  options,
}: PayloadWithOptions<{ id: string }>) =>
  APIS.Clusters.clustersClusterIdStopPost(payload.id, options)

export function useStopCluster() {
  return useMutation(stopCluster)
}

const previewCreateCluster = ({
  payload,
  options,
}: PayloadWithOptions<RequestClusterCreate>) =>
  APIS.Clusters.clustersPreviewPost(payload, options)

export function usePreviewCreateCluster() {
  return useMutation(previewCreateCluster)
}

/**
 * Cluster Params
 */

export const CACHE_CLUSTER_PARAMS = 'cluster-params'

export type QueryClusterParamsParams = Paged<{
  id: string
  paramName?: string
}>

export function useQueryClusterParams(
  params: QueryClusterParamsParams,
  options?: PartialUseQueryOptions
) {
  const { id, page, pageSize, paramName } = params
  return withRequestId((requestId) =>
    useQuery(
      [CACHE_CLUSTER_PARAMS, id, page, pageSize],
      () =>
        APIS.ClusterParams.clustersClusterIdParamsGet(
          id,
          page,
          pageSize,
          paramName,
          {
            requestId,
          }
        ),
      options
    )
  )
}

export async function invalidateClusterParams(
  client: QueryClient,
  clusterId: string
) {
  await client.invalidateQueries([CACHE_CLUSTER_PARAMS, clusterId])
}

const updateClusterParams = ({
  payload: { clusterId, ...payload },
  options,
}: PayloadWithOptions<RequestClusterParamsUpdate & { clusterId: string }>) =>
  APIS.ClusterParams.clustersClusterIdParamsPut(clusterId, payload, options)

export function useUpdateClusterParams() {
  return useMutation(updateClusterParams)
}

/**
 * Cluster Logs
 */

export const CACHE_CLUSTER_LOGS = 'cluster-logs'

export type QueryClusterLogsParams = {
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
  params: QueryClusterLogsParams,
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
  } = params
  return withRequestId((requestId) =>
    useQuery(
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
          startTime,
          { requestId }
        ),
      options
    )
  )
}

/**
 * Cluster Backups
 */

export const CACHE_CLUSTER_BACKUPS = 'cluster-backups'
export const CACHE_CLUSTER_BACKUP_STRATEGY = 'cluster-backup-strategy'

export type QueryClusterBackupStrategyParams = {
  id: string
}

export function useQueryClusterBackupStrategy(
  params: QueryClusterBackupStrategyParams,
  options?: PartialUseQueryOptions
) {
  const { id } = params
  return withRequestId((requestId) =>
    useQuery(
      [CACHE_CLUSTER_BACKUP_STRATEGY, id],
      () => APIS.ClusterBackups.clustersClusterIdStrategyGet(id, { requestId }),
      options
    )
  )
}

export async function invalidateClusterBackupStrategy(
  client: QueryClient,
  clusterId: string
) {
  await client.invalidateQueries([CACHE_CLUSTER_BACKUP_STRATEGY, clusterId])
}

const updateClusterBackupStrategy = ({
  payload: { clusterId, ...payload },
  options,
}: PayloadWithOptions<RequestBackupStrategyUpdate & { clusterId: string }>) =>
  APIS.ClusterBackups.clustersClusterIdStrategyPut(clusterId, payload, options)

export function useUpdateClusterBackupStrategy() {
  return useMutation(updateClusterBackupStrategy)
}

export type QueryClusterBackupsParams = Paged<{
  clusterId: string
  startTime?: number
  endTime?: number
}>

export function useQueryClusterBackups(
  query: QueryClusterBackupsParams,
  options?: PartialUseQueryOptions
) {
  const { clusterId, page, pageSize, startTime, endTime } = query
  return withRequestId((requestId) =>
    useQuery(
      [CACHE_CLUSTER_BACKUPS, clusterId, page, pageSize, startTime, endTime],
      () =>
        APIS.ClusterBackups.backupsGet(
          undefined,
          clusterId,
          endTime,
          page,
          pageSize,
          startTime,
          { requestId }
        ),
      options
    )
  )
}

export async function invalidateClusterBackups(
  client: QueryClient,
  clusterId: string
) {
  await client.invalidateQueries([CACHE_CLUSTER_BACKUPS, clusterId])
}

const deleteClusterBackup = ({
  payload,
  options,
}: PayloadWithOptions<{
  backupId: number
  clusterId: string
}>) =>
  APIS.ClusterBackups.backupsBackupIdDelete(
    payload.backupId,
    {
      clusterId: payload.clusterId,
    },
    options
  )

export function useDeleteClusterBackup() {
  return useMutation(deleteClusterBackup)
}

const createClusterBackup = ({
  payload,
  options,
}: PayloadWithOptions<RequestBackupCreate>) =>
  APIS.ClusterBackups.backupsPost(payload, options)

export function useCreateClusterBackup() {
  return useMutation(createClusterBackup)
}

const restoreClusterBackup = ({
  payload,
  options,
}: PayloadWithOptions<RequestBackupRestore>) =>
  APIS.Clusters.clustersRestorePost(payload, options)

export function useRestoreClusterBackup() {
  return useMutation(restoreClusterBackup)
}

/**
 * Cluster Dashboard
 */

const CACHE_CLUSTER_DASHBOARD = 'cluster-dashboard'

export type QueryClusterDashboardParams = {
  id: string
}

export function useQueryClusterDashboard(
  query: QueryClusterDashboardParams,
  options?: PartialUseQueryOptions
) {
  const { id } = query
  return withRequestId((requestId) =>
    useQuery(
      [CACHE_CLUSTER_DASHBOARD, id],
      () => APIS.Clusters.clustersClusterIdDashboardGet(id, { requestId }),
      options
    )
  )
}

/**
 * Cluster External Services
 */

const CACHE_CLUSTER_EXTERNAL_SERVICE = 'cluster-external-service'

export type QueryClusterExternalServiceParams = {
  id: string
}

export function useQueryClusterExternalService(
  query: QueryClusterExternalServiceParams,
  options?: PartialUseQueryOptions
) {
  const { id } = query
  return withRequestId((requestId) =>
    useQuery(
      [CACHE_CLUSTER_EXTERNAL_SERVICE, id],
      () => APIS.Clusters.clustersClusterIdMonitorGet(id, { requestId }),
      {
        cacheTime: 1000 * 60 * 60,
        staleTime: 1000 * 60 * 60,
        refetchOnWindowFocus: false,
        ...options,
      }
    )
  )
}

/**
 * Cluster Scaling
 */

const scaleOutCluster = ({
  payload: { clusterId, ...payload },
  options,
}: PayloadWithOptions<
  RequestClusterScaleOut & {
    clusterId: string
  }
>) => APIS.Clusters.clustersClusterIdScaleOutPost(clusterId, payload, options)

export function useClusterScaleOut() {
  return useMutation(scaleOutCluster)
}

const previewScaleOutCluster = ({
  payload: { id, ...payload },
  options,
}: PayloadWithOptions<RequestClusterScaleOut & { id: string }>) =>
  APIS.Clusters.clustersClusterIdPreviewScaleOutGet(id, payload, options)

export function usePreviewScaleOutCluster() {
  return useMutation(previewScaleOutCluster)
}

const scaleInCluster = ({
  payload: { clusterId, ...payload },
  options,
}: PayloadWithOptions<
  RequestClusterScaleIn & {
    clusterId: string
  }
>) => APIS.Clusters.clustersClusterIdScaleInPost(clusterId, payload, options)

export function useClusterScaleIn() {
  return useMutation(scaleInCluster)
}

/**
 * Cluster Taking Over
 */

const takeOverCluster = ({
  payload,
  options,
}: PayloadWithOptions<RequestClusterTakeover>) =>
  APIS.Clusters.clustersTakeoverPost(payload, options)

export function useClusterTakeover() {
  return useMutation(takeOverCluster)
}
