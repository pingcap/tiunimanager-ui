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

import { QueryClient, useMutation, useQuery } from 'react-query'
import { APIS } from '@/api/client'
import {
  ClusterDownstreamKafka,
  ClusterDownstreamMySQL,
  ClusterDownstreamTiDB,
  RequestBackupCreate,
  RequestBackupRestore,
  RequestBackupStrategyUpdate,
  RequestBackupCancel,
  RequestClusterCreate,
  RequestClusterDataReplicationCreate,
  RequestClusterDataReplicationUpdate,
  RequestClusterParamsUpdate,
  RequestClusterScaleIn,
  RequestClusterScaleOut,
  RequestClusterTakeover,
  RequestClusterClone,
  RequestClusterUpgrade,
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
  instanceType?: string
  paramName?: string
}>

export function useQueryClusterParams(
  params: QueryClusterParamsParams,
  options?: PartialUseQueryOptions
) {
  const { id, instanceType, paramName, page, pageSize } = params
  return withRequestId((requestId) =>
    useQuery(
      [CACHE_CLUSTER_PARAMS, id, instanceType, paramName, page, pageSize],
      () =>
        APIS.ClusterParams.clustersClusterIdParamsGet(
          id,
          instanceType,
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
  payload: { clusterId, ...leftPayload },
  options,
}: PayloadWithOptions<RequestClusterParamsUpdate & { clusterId: string }>) =>
  APIS.ClusterParams.clustersClusterIdParamsPut(clusterId, leftPayload, options)

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
 * Cancel a cluster backup task
 */
const cancelClusterBackup = ({
  payload,
  options,
}: PayloadWithOptions<RequestBackupCancel>) =>
  APIS.ClusterBackups.backupsCancelPost(payload, options)

export function useCancelClusterBackup() {
  return useMutation(cancelClusterBackup)
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
  APIS.Clusters.clustersClusterIdPreviewScaleOutPost(id, payload, options)

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
 * Cluster Clone
 */

const cloneCluster = ({
  payload,
  options,
}: PayloadWithOptions<RequestClusterClone>) =>
  APIS.Clusters.clustersClonePost(payload, options)

export function useClusterClone() {
  return useMutation(cloneCluster)
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

/***************************
 * Cluster Data Replication
 ***************************/

const CACHE_CLUSTER_DATA_REPLICATION_LIST = 'cluster-data-replication-list'
const CACHE_CLUSTER_DATA_REPLICATION_DETAIL = 'cluster-data-replication-detail'

/**
 * Hook for querying cluster data replication task list
 * @param query query filter
 * @param options react-query useQuery options
 */
export function useQueryClusterDataReplicationList(
  query: Paged<{
    clusterId: string
  }>,
  options?: PartialUseQueryOptions
) {
  const { clusterId, page, pageSize } = query

  return withRequestId((requestId) =>
    useQuery(
      [CACHE_CLUSTER_DATA_REPLICATION_LIST, page, pageSize, clusterId],
      () =>
        APIS.ClusterDataReplication.changefeedsGet(clusterId, page, pageSize, {
          requestId,
        }),
      options
    )
  )
}

/**
 * Invalidate the cache of cluster data replication task list
 * @param client react-query QueryClient
 */
export async function invalidateClusterDataReplicationList(
  client: QueryClient
) {
  await client.invalidateQueries(CACHE_CLUSTER_DATA_REPLICATION_LIST)
}

/**
 * Hook for querying cluster data replication task detail
 * @param query query filter
 * @param options react-query useQuery options
 */
export function useQueryClusterDataReplicationDetail(
  query: { id: string },
  options?: PartialUseQueryOptions
) {
  const { id } = query

  return withRequestId((requestId) =>
    useQuery(
      [CACHE_CLUSTER_DATA_REPLICATION_DETAIL, id],
      () =>
        APIS.ClusterDataReplication.changefeedsChangeFeedTaskIdGet(id, {
          requestId,
        }),
      options
    )
  )
}

/**
 * Create a cluster data replication task
 * @param payload creation payload
 */
const createClusterDataReplication = ({
  payload,
  options,
}: PayloadWithOptions<
  {
    downstream:
      | ClusterDownstreamMySQL
      | ClusterDownstreamTiDB
      | ClusterDownstreamKafka
  } & Omit<RequestClusterDataReplicationCreate, 'downstream'>
>) => {
  return APIS.ClusterDataReplication.changefeedsPost(payload, options)
}

/**
 * Hook for creating a cluster data replication task
 */
export function useCreateClusterDataReplication() {
  return useMutation(createClusterDataReplication)
}

/**
 * Update a cluster date replication task
 * @param payload update payload
 */
const updateClusterDataReplication = ({
  payload,
  options,
}: PayloadWithOptions<
  {
    id: string
    downstream:
      | ClusterDownstreamMySQL
      | ClusterDownstreamTiDB
      | ClusterDownstreamKafka
  } & Omit<RequestClusterDataReplicationUpdate, 'downstream'>
>) => {
  const { id, ...leftPayload } = payload

  return APIS.ClusterDataReplication.changefeedsChangeFeedTaskIdUpdatePost(
    id,
    leftPayload,
    options
  )
}

/**
 * Hook for updating a cluster data replication task
 */
export function useUpdateClusterDataReplication() {
  return useMutation(updateClusterDataReplication)
}

/**
 * Delete a cluster data replication task
 * @param payload delete payload
 */
const deleteClusterDataReplication = ({
  payload: { id },
  options,
}: PayloadWithOptions<{ id: string }>) =>
  APIS.ClusterDataReplication.changefeedsChangeFeedTaskIdDelete(id, options)

/**
 * Hook for deleting a cluster data replication task
 */
export function useDeleteClusterDataReplication() {
  return useMutation(deleteClusterDataReplication)
}

/**
 * Suspend a running cluster data replication task
 * @param payload suspension payload
 */
const suspendClusterDataReplication = ({
  payload: { id },
  options,
}: PayloadWithOptions<{ id: string }>) =>
  APIS.ClusterDataReplication.changefeedsChangeFeedTaskIdPausePost(id, options)

/**
 * Hook for suspending a cluster data replication task
 */
export function useSuspendClusterDataReplication() {
  return useMutation(suspendClusterDataReplication)
}

/**
 * Resume a suspended cluster data replication task
 * @param payload resumption payload
 */
const resumeClusterDataReplication = ({
  payload: { id },
  options,
}: PayloadWithOptions<{ id: string }>) =>
  APIS.ClusterDataReplication.changefeedsChangeFeedTaskIdResumePost(id, options)

/**
 * Hook for resuming a suspended cluster data replication task
 */
export function useResumeClusterDataReplication() {
  return useMutation(resumeClusterDataReplication)
}

/**
 * Cluster Upgrade
 */

const CACHE_CLUSTER_UPGRADE_PATH = 'cluster-upgrade-path'
const CACHE_CLUSTER_UPGRADE_DIFF = 'cluster-upgrade-diff'

/**
 * Hook for querying cluster upgrade path
 * @param query query filter
 * @param options react-query useQuery options
 */
export function useQueryClusterUpgradePath(
  query: {
    clusterId: string
  },
  options?: PartialUseQueryOptions
) {
  const { clusterId } = query

  return withRequestId((requestId) =>
    useQuery(
      [CACHE_CLUSTER_UPGRADE_PATH, clusterId],
      () =>
        APIS.ClusterUpgrade.clustersClusterIdUpgradePathGet(clusterId, {
          requestId,
        }),
      options
    )
  )
}

/**
 * Hook for querying cluster upgrade diff
 * @param query query filter
 * @param options react-query useQuery options
 */
export function useQueryClusterUpgradeDiff(
  query: {
    clusterId: string
    targetVersion: string
  },
  options?: PartialUseQueryOptions
) {
  const { clusterId, targetVersion } = query

  return withRequestId((requestId) =>
    useQuery(
      [CACHE_CLUSTER_UPGRADE_DIFF, clusterId, targetVersion],
      () =>
        APIS.ClusterUpgrade.clustersClusterIdUpgradeDiffGet(
          clusterId,
          targetVersion,
          {
            requestId,
          }
        ),
      options
    )
  )
}

/**
 * Create a cluster upgrade task
 * @param payload upgrade payload
 */
const upgradeCluster = ({
  payload,
  options,
}: PayloadWithOptions<{ clusterId: string } & RequestClusterUpgrade>) => {
  const { clusterId, ...leftPayload } = payload

  return APIS.ClusterUpgrade.clustersClusterIdUpgradePost(
    clusterId,
    leftPayload,
    options
  )
}

/**
 * Hook for creating a cluster upgrade task
 */
export function useUpgradeCluster() {
  return useMutation(upgradeCluster)
}

/**********************
 * Cluster Role Switch
 **********************/

type RequestClusterRoleSwitchover = {
  sourceClusterId: string
  targetClusterId: string
  checkOnly?: boolean
  forced?: boolean
}

/**
 * Create a cluster role switchover task
 * @param payload payload of switchover
 */
const switchoverClusterRole = ({
  payload,
  options,
}: PayloadWithOptions<RequestClusterRoleSwitchover>) => {
  const { sourceClusterId, targetClusterId, checkOnly, forced } = payload

  return APIS.ClusterRoleSwitchover.clustersSwitchoverPost(
    {
      sourceClusterID: sourceClusterId,
      targetClusterID: targetClusterId,
      onlyCheck: checkOnly,
      force: forced,
    },
    options
  )
}

/**
 * Hook for creating a cluster role switchover task
 */
export function useSwitchoverClusterRole() {
  return useMutation(switchoverClusterRole)
}
