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

import { useState, useEffect, useCallback } from 'react'
import { useQueryClient } from 'react-query'
import { loadI18n, useI18n } from '@i18n-macro'
import {
  useDeleteParamGroup,
  invalidateParamGroupList,
} from '@/api/hooks/param-group'

loadI18n()

/**
 * tricky!
 * Force update for resolving Antd pro-form LightFilter bug
 */
export function useForceUpdateSearch() {
  const { i18n } = useI18n()
  const [searchHidden, setSearchHidden] = useState(true)

  useEffect(() => {
    setSearchHidden(false)

    setTimeout(() => {
      setSearchHidden(true)
    })
  }, [i18n.language])

  return searchHidden
}

/**
 * Hook for delete a parameter group
 */
export function useDeleteParamGroupAction() {
  const { t } = useI18n()
  const queryClient = useQueryClient()
  const deleteParamGroup = useDeleteParamGroup()

  const deleteAction = useCallback(
    (paramGroupId: string) =>
      deleteParamGroup.mutateAsync(
        {
          payload: { paramGroupId },
          options: {
            successMessage: t('delete.success'),
            errorMessage: t('delete.failed'),
          },
        },
        {
          onSettled() {
            return Promise.allSettled([invalidateParamGroupList(queryClient)])
          },
        }
      ),
    [queryClient, deleteParamGroup.mutateAsync]
  )

  return deleteAction
}
