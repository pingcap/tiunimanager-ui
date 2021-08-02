import { createGlobalState } from 'react-hooks-global-state'
import { ModelsClusterTypeSpec } from '#/api'
import { APIS } from '@/api/client'

type KnowledgeStore = {
  state: ModelsClusterTypeSpec[]
}

const { getGlobalState, setGlobalState, useGlobalState } =
  createGlobalState<KnowledgeStore>({
    state: [],
  })

async function fetchKnowledge(token: string) {
  const { data } = await APIS.Cluster.clusterKnowledgeGet(token)
  // TODO: api err handler
  setGlobalState('state', data.data!)
  return data.data!
}

export async function getKnowledge(token: string) {
  const state = getGlobalState('state')
  if (state.length) return state
  return await fetchKnowledge(token)
}

export const useKnowledge = useGlobalState
