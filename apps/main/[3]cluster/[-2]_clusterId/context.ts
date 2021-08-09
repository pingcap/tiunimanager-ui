import { createContext, useContext } from 'react'
import { ClusterapiDetailClusterRsp } from '#/api'

const ClusterContext = createContext<ClusterapiDetailClusterRsp>({})

export const ClusterProvider = ClusterContext.Provider
export function useClusterContext() {
  return useContext(ClusterContext)
}
