import { RequestTransportExport, RequestTransportImport } from '@/api/model'
import { APIS, PartialUseQueryOptions } from '@/api/client'
import { QueryClient, useMutation, useQuery } from 'react-query'

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

const deleteTransportRecord = ({
  recordId,
  clusterId,
}: {
  recordId: number
  clusterId: string
}) => APIS.Transport.clustersTransportRecordIdDelete(recordId, { clusterId })

export function useDeleteTransportRecord() {
  return useMutation(deleteTransportRecord)
}
