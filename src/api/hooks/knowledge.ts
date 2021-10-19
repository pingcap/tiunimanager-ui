import { useQuery } from 'react-query'
import { APIS, PartialUseQueryOptions } from '@/api/client'

export function useQueryKnowledge(options?: PartialUseQueryOptions) {
  return useQuery(['knowledge'], () => APIS.Knowledge.knowledgesGet(), {
    cacheTime: Infinity,
    staleTime: Infinity,
    ...options,
  })
}
