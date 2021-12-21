import { APIS, PartialUseQueryOptions } from '@/api/client'
import { useQuery } from 'react-query'
import { TaskWorkflowStatus } from '../model'

export const CACHE_TASK = 'tasks'
export const CACHE_TASK_DETAIL = 'task-detail'

export function useQueryTasks(
  query: {
    bizId?: string
    page?: number
    pageSize?: number
    status?: TaskWorkflowStatus
    keyword?: string
  },
  options?: PartialUseQueryOptions
) {
  const { bizId, page, pageSize, status, keyword } = query

  return useQuery(
    [CACHE_TASK, bizId, page, pageSize, status, keyword],
    () => APIS.Task.workflowGet(bizId, keyword, page, pageSize, status),
    options
  )
}

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
