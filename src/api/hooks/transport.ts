import { RequestTransportExport, RequestTransportImport } from '@/api/model'
import { APIS } from '@/api/client'
import { QueryClient, useMutation, useQuery } from 'react-query'
import { AxiosRequestConfig } from 'axios'
import { PartialUseQueryOptions, withRequestOptions } from '@/api/hooks/utils'

const importCluster = withRequestOptions(
  (payload: RequestTransportImport, options?: AxiosRequestConfig) =>
    APIS.ClustersImport.clustersImportPost(payload, options)
)

export function useImportCluster() {
  return useMutation(importCluster)
}

const exportCluster = withRequestOptions(
  (payload: RequestTransportExport, options?: AxiosRequestConfig) =>
    APIS.ClustersExport.clustersExportPost(payload, options)
)

export function useExportCluster() {
  return useMutation(exportCluster)
}

const CACHE_TRANSPORT_RECORDS = 'transport-records'

export function useQueryTransportRecords(
  query: {
    page?: number
    pageSize?: number
    clusterId?: string
    reImport?: boolean
    startTime?: number
    endTime?: number
  },
  options?: PartialUseQueryOptions
) {
  const { page, pageSize, clusterId, reImport, startTime, endTime } = query
  return useQuery(
    [
      CACHE_TRANSPORT_RECORDS,
      page,
      pageSize,
      clusterId,
      reImport,
      startTime,
      endTime,
    ],
    () =>
      APIS.Transport.clustersTransportGet(
        clusterId!,
        endTime,
        page,
        pageSize,
        reImport,
        undefined,
        startTime
      ),
    options
  )
}

export async function invalidateTransportRecords(client: QueryClient) {
  await client.invalidateQueries([CACHE_TRANSPORT_RECORDS])
}

const deleteTransportRecord = withRequestOptions(
  (
    {
      recordId,
      clusterId,
    }: {
      recordId: number
      clusterId: string
    },
    options?: AxiosRequestConfig
  ) =>
    APIS.Transport.clustersTransportRecordIdDelete(
      recordId,
      { clusterId },
      options
    )
)

export function useDeleteTransportRecord() {
  return useMutation(deleteTransportRecord)
}
