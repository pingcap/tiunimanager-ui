import { createContext, useContext } from 'react'
import { ClusterapiClusterDisplayInfo } from '#/api'

const ClusterContext = createContext<ClusterapiClusterDisplayInfo>({})

export const ClusterProvider = ClusterContext.Provider
export function useClusterContext() {
  return useContext(ClusterContext)
}
