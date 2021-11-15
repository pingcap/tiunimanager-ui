import { createContext, useContext } from 'react'
import { ResponseClusterDetail } from '@/api/model'

const ClusterContext = createContext<ResponseClusterDetail>({})

export const ClusterProvider = ClusterContext.Provider
export function useClusterContext() {
  return useContext(ClusterContext)
}
