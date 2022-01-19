import { RequestTransportExport, RequestTransportImport } from '@/api/model'
import { APIS } from '@/api/client'
import { QueryClient, useMutation, useQuery } from 'react-query'
import {
  Paged,
  PartialUseQueryOptions,
  PayloadWithOptions,
  withRequestId,
} from '@/api/hooks/utils'

const importCluster = ({
  payload,
  options,
}: PayloadWithOptions<RequestTransportImport>) =>
  APIS.ClustersImport.clustersImportPost(payload, options)

export function useImportCluster() {
  return useMutation(importCluster)
}

const exportCluster = ({
  payload,
  options,
}: PayloadWithOptions<RequestTransportExport>) =>
  APIS.ClustersExport.clustersExportPost(payload, options)

export function useExportCluster() {
  return useMutation(exportCluster)
}

const CACHE_TRANSPORT_RECORDS = 'transport-records'

export type QueryTransportRecordsParams = Paged<{
  clusterId?: string
  reImport?: boolean
  startTime?: number
  endTime?: number
}>

export function useQueryTransportRecords(
  query: QueryTransportRecordsParams,
  options?: PartialUseQueryOptions
) {
  const { page, pageSize, clusterId, reImport, startTime, endTime } = query
  return withRequestId((requestId) =>
    useQuery(
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
          startTime,
          { requestId }
        ),
      options
    )
  )
}

export async function invalidateTransportRecords(client: QueryClient) {
  await client.invalidateQueries([CACHE_TRANSPORT_RECORDS])
}

const deleteTransportRecord = ({
  payload: { recordId, clusterId },
  options,
}: PayloadWithOptions<{
  recordId: number
  clusterId: string
}>) =>
  APIS.Transport.clustersTransportRecordIdDelete(
    recordId,
    { clusterId },
    options
  )

export function useDeleteTransportRecord() {
  return useMutation(deleteTransportRecord)
}
