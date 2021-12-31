import { useState, useCallback, useMemo } from 'react'
import { useQueryClient } from 'react-query'
import { useApplyParamGroup } from '@/api/hooks/param-group'
import { errToMsg } from '@/utils/error'
import type { ParamGroupItem } from '@/api/model'

/**
 * Mutation result callbacks
 * for applying a parameter group
 */
export interface ApplyingActionCallbacks {
  onSuccess: (msg?: string | number) => void
  onError: (msg?: string) => void
}

/**
 * Mutation payload for applying a parameter group
 */
export interface ParamGroupApplyingPayload {
  cluster: string
  reboot: boolean
}

/**
 * Hook for using a parameter group applying modal
 * @param dataSource parameter group list
 */
export function useApplyingModal(dataSource?: ParamGroupItem[]) {
  // Modal visible status
  const [visible, setVisible] = useState(false)

  const [paramGroupId, setParamGroupId] = useState<string>()

  // data source for modal
  const applyingData = useMemo(() => {
    return dataSource && paramGroupId
      ? dataSource.filter((item) => item.paramGroupId === paramGroupId)[0] ?? {}
      : {}
  }, [dataSource, paramGroupId])

  const onOpen = useCallback((paramGroupId: string) => {
    setParamGroupId(paramGroupId)
    setVisible(true)
  }, [])
  const onClose = useCallback(() => {
    setVisible(false)
    setParamGroupId(undefined)
  }, [])

  const queryClient = useQueryClient()
  const applyParamGroup = useApplyParamGroup()

  // Modal onConfirm callback
  const applyingAction = useCallback(
    (payload: ParamGroupApplyingPayload, callbacks: ApplyingActionCallbacks) =>
      applyParamGroup.mutateAsync(
        {
          paramGroupId: paramGroupId!,
          clusterId: payload.cluster,
          reboot: payload.reboot,
        },
        {
          onSuccess(response) {
            callbacks.onSuccess(response.data.data?.paramGroupId)

            onClose()
          },
          onError(e: any) {
            callbacks.onError(errToMsg(e))
          },
        }
      ),
    [queryClient, applyParamGroup.mutateAsync, onClose, paramGroupId]
  )

  return {
    visible,
    onOpen,
    onClose,
    applyingData,
    applyingAction,
  }
}
