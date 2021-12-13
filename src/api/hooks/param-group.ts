import { QueryClient, useMutation, useQuery } from 'react-query'
import {
  ParamGroupDBType,
  ParamGroupCreationType,
  RequestParamGroupCreate,
  RequestParamGroupUpdate,
  RequestParamGroupCopy,
  RequestParamGroupApply,
} from '@/api/model'
import { APIS, PartialUseQueryOptions } from '@/api/client'

const CACHE_PARAM_GROUP_LIST_KEY = 'param-group-list'

const CACHE_PARAM_GROUP_DETAIL_KEY = 'param-group-detail'

export function useQueryParamGroupList(
  query: {
    page?: number
    pageSize?: number
    name?: string
    dbType?: ParamGroupDBType
    dbVersion?: string
    spec?: string
    creationType?: ParamGroupCreationType
    isParamsIncluded?: boolean
  },
  options?: PartialUseQueryOptions
) {
  const {
    page,
    pageSize,
    name,
    dbType,
    dbVersion,
    spec,
    creationType,
    isParamsIncluded,
  } = query

  return useQuery(
    [
      CACHE_PARAM_GROUP_LIST_KEY,
      page,
      pageSize,
      name,
      dbType,
      dbVersion,
      spec,
      creationType,
      isParamsIncluded,
    ],
    () =>
      APIS.ParamGroup.paramGroupsGet(
        dbType,
        creationType,
        isParamsIncluded,
        name,
        page,
        pageSize,
        spec,
        dbVersion
      ),
    options
  )
}

export async function invalidateParamGroupList(client: QueryClient) {
  await client.invalidateQueries([CACHE_PARAM_GROUP_LIST_KEY])
}

export function useQueryParamGroupDetail(
  query: { id: string },
  options?: PartialUseQueryOptions
) {
  const { id } = query

  return useQuery(
    [CACHE_PARAM_GROUP_DETAIL_KEY, id],
    () => APIS.ParamGroup.paramGroupsParamGroupIdGet(id),
    options
  )
}

const createParamGroup = (payload: RequestParamGroupCreate) =>
  APIS.ParamGroup.paramGroupsPost(payload)

export function useCreateParamGroup() {
  return useMutation(createParamGroup)
}

const updateParamGroup = (payload: RequestParamGroupUpdate) =>
  APIS.ParamGroup.paramGroupsParamGroupIdPut(payload)

export function useUpdateParamGroup() {
  return useMutation(updateParamGroup)
}

const copyParamGroup = (payload: RequestParamGroupCopy) =>
  APIS.ParamGroup.paramGroupsParamGroupIdCopyPost(payload)

export function useCopyParamGroup() {
  return useMutation(copyParamGroup)
}

const deleteParamGroup = (paramGroupId: string) =>
  APIS.ParamGroup.paramGroupsParamGroupIdDelete(paramGroupId)

export function useDeleteParamGroup() {
  return useMutation(deleteParamGroup)
}

const applyParamGroup = (payload: RequestParamGroupApply) =>
  APIS.ParamGroup.paramGroupsParamGroupIdApplyPost(payload)

export function useApplyParamGroup() {
  return useMutation(applyParamGroup)
}
