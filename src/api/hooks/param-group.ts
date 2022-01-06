import { QueryClient, useMutation, useQuery } from 'react-query'
import {
  ParamGroupDBType,
  ParamGroupCreationType,
  RequestParamGroupCreate,
  RequestParamGroupUpdate,
  RequestParamGroupCopy,
  RequestParamGroupApply,
} from '@/api/model'
import { APIS } from '@/api/client'
import { PartialUseQueryOptions } from '@/api/hooks/utils'
import { AxiosRequestConfig } from 'axios'

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
        spec,
        dbVersion,
        dbType,
        creationType,
        isParamsIncluded,
        name,
        page,
        pageSize
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

const createParamGroup = ({
  payload,
  options,
}: {
  payload: RequestParamGroupCreate
  options?: AxiosRequestConfig
}) => APIS.ParamGroup.paramGroupsPost(payload, options)

export function useCreateParamGroup() {
  return useMutation(createParamGroup)
}

const updateParamGroup = ({
  payload: { paramGroupId, ...leftPayload },
  options,
}: {
  payload: { paramGroupId: string } & RequestParamGroupUpdate
  options?: AxiosRequestConfig
}) =>
  APIS.ParamGroup.paramGroupsParamGroupIdPut(paramGroupId, leftPayload, options)

export function useUpdateParamGroup() {
  return useMutation(updateParamGroup)
}

const copyParamGroup = ({
  payload: { paramGroupId, ...leftPayload },
  options,
}: {
  payload: { paramGroupId: string } & RequestParamGroupCopy
  options?: AxiosRequestConfig
}) =>
  APIS.ParamGroup.paramGroupsParamGroupIdCopyPost(
    paramGroupId,
    leftPayload,
    options
  )

export function useCopyParamGroup() {
  return useMutation(copyParamGroup)
}

const deleteParamGroup = (paramGroupId: string) =>
  APIS.ParamGroup.paramGroupsParamGroupIdDelete(paramGroupId)

export function useDeleteParamGroup() {
  return useMutation(deleteParamGroup)
}

const applyParamGroup = ({
  payload: { paramGroupId, ...leftPayload },
  options,
}: {
  payload: { paramGroupId: string } & RequestParamGroupApply
  options?: AxiosRequestConfig
}) =>
  APIS.ParamGroup.paramGroupsParamGroupIdApplyPost(
    paramGroupId,
    leftPayload,
    options
  )

export function useApplyParamGroup() {
  return useMutation(applyParamGroup)
}
