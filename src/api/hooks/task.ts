import { APIS } from '@/api/client'
import { QueryClient, useQuery } from 'react-query'
import { TaskWorkflowStatus } from '../model'
import { PartialUseQueryOptions } from './utils'

export const CACHE_TASK = 'tasks'
export const CACHE_TASK_DETAIL = 'task-detail'

/**
 * Hook for querying task list
 * @param query task query parameters
 * @param options useQuery options
 */
export function useQueryTasks(
  query: {
    page?: number
    pageSize?: number
    keyword?: string
    status?: TaskWorkflowStatus
    bizId?: string
    bizType?: string
  },
  options?: PartialUseQueryOptions
) {
  const { page, pageSize, keyword, status, bizId, bizType } = query

  return useQuery(
    [CACHE_TASK, page, pageSize, keyword, status, bizId, bizType],
    () =>
      APIS.Task.workflowGet(bizId, bizType, keyword, page, pageSize, status),
    options
  )
}

/**
 * Hook for querying a task detail
 * @param query task detail query parameters
 * @param options useQuery options
 */
export function useQueryTaskDetail(
  query: {
    id: string
  },
  options?: PartialUseQueryOptions
) {
  const { id } = query
  return useQuery(
    [CACHE_TASK_DETAIL, id],
    () => APIS.Task.workflowWorkFlowIdGet(id),
    options
  )
}

/**
 * Invalidate the matching task detail queries
 * @param client react-query QueryClient object
 * @param id task id
 */
export async function invalidateTaskDetail(client: QueryClient, id?: string) {
  const queryKey = id ? [CACHE_TASK_DETAIL, id] : CACHE_TASK_DETAIL

  return await client.invalidateQueries(queryKey)
}
