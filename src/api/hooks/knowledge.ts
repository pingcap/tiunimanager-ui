import { useQuery } from 'react-query'
import { APIS } from '@/api/client'
import { PartialUseQueryOptions } from '@/api/hooks/utils'

export function useQueryKnowledge(options?: PartialUseQueryOptions) {
  return useQuery(['knowledge'], () => APIS.Knowledge.knowledgesGet(), {
    cacheTime: Infinity,
    staleTime: Infinity,
    ...options,
  })
}
