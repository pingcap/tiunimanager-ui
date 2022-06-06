/*
 * Copyright 2022 PingCAP, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
import {
  Paged,
  PartialUseQueryOptions,
  PayloadWithOptions,
  withRequestId,
} from '@/api/hooks/utils'

const CACHE_PARAM_GROUP_LIST_KEY = 'param-group-list'

const CACHE_PARAM_GROUP_DETAIL_KEY = 'param-group-detail'

export function useQueryParamGroupList(
  query: Paged<{
    name?: string
    dbType?: ParamGroupDBType
    dbVersion?: string
    spec?: string
    creationType?: ParamGroupCreationType
    isParamsIncluded?: boolean
  }>,
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

  return withRequestId((requestId) =>
    useQuery(
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
          pageSize,
          { requestId }
        ),
      options
    )
  )
}

export async function invalidateParamGroupList(client: QueryClient) {
  await client.invalidateQueries([CACHE_PARAM_GROUP_LIST_KEY])
}

export function useQueryParamGroupDetail(
  query: {
    id: string
    instanceType?: string
    paramName?: string
  },
  options?: PartialUseQueryOptions
) {
  const { id, instanceType, paramName } = query

  return withRequestId((requestId) =>
    useQuery(
      [CACHE_PARAM_GROUP_DETAIL_KEY, id, instanceType, paramName],
      () =>
        APIS.ParamGroup.paramGroupsParamGroupIdGet(
          id,
          instanceType,
          paramName,
          {
            requestId,
          }
        ),
      options
    )
  )
}

const createParamGroup = ({
  payload,
  options,
}: PayloadWithOptions<RequestParamGroupCreate>) =>
  APIS.ParamGroup.paramGroupsPost(payload, options)

export function useCreateParamGroup() {
  return useMutation(createParamGroup)
}

const updateParamGroup = ({
  payload: { paramGroupId, ...leftPayload },
  options,
}: PayloadWithOptions<{ paramGroupId: string } & RequestParamGroupUpdate>) =>
  APIS.ParamGroup.paramGroupsParamGroupIdPut(paramGroupId, leftPayload, options)

export function useUpdateParamGroup() {
  return useMutation(updateParamGroup)
}

const copyParamGroup = ({
  payload: { paramGroupId, ...leftPayload },
  options,
}: PayloadWithOptions<{ paramGroupId: string } & RequestParamGroupCopy>) =>
  APIS.ParamGroup.paramGroupsParamGroupIdCopyPost(
    paramGroupId,
    leftPayload,
    options
  )

export function useCopyParamGroup() {
  return useMutation(copyParamGroup)
}

const deleteParamGroup = ({
  payload: { paramGroupId },
  options,
}: PayloadWithOptions<{ paramGroupId: string }>) =>
  APIS.ParamGroup.paramGroupsParamGroupIdDelete(paramGroupId, options)

export function useDeleteParamGroup() {
  return useMutation(deleteParamGroup)
}

const applyParamGroup = ({
  payload: { paramGroupId, ...leftPayload },
  options,
}: PayloadWithOptions<{ paramGroupId: string } & RequestParamGroupApply>) =>
  APIS.ParamGroup.paramGroupsParamGroupIdApplyPost(
    paramGroupId,
    leftPayload,
    options
  )

export function useApplyParamGroup() {
  return useMutation(applyParamGroup)
}
