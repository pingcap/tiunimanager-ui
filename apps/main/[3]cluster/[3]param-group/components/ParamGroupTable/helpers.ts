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
            actionName: t('message.name'),
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
