import { createContext, useContext } from 'react'
import { ClusterDetails } from '@/api/model'

const ClusterContext = createContext<ClusterDetails>({})

export const ClusterProvider = ClusterContext.Provider
export function useClusterContext() {
  return useContext(ClusterContext)
}
