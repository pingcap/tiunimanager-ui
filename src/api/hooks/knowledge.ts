import { useQuery } from 'react-query'
import { APIS } from '@/api/client'
import { PartialUseQueryOptions, withRequestId } from '@/api/hooks/utils'

// TODO: remove knowledge-related logic
export function useQueryKnowledge(options?: PartialUseQueryOptions) {
  return withRequestId((requestId) =>
    useQuery(['knowledge'], () => APIS.Knowledge.knowledgesGet({ requestId }), {
      cacheTime: Infinity,
      staleTime: Infinity,
      ...options,
    })
  )
}
