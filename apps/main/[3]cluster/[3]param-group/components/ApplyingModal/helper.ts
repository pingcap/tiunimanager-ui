/*
 * Copyright 2022 PingCAP
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

import { useState, useCallback, useMemo } from 'react'
import { useQueryClient } from 'react-query'
import { loadI18n, useI18n } from '@i18n-macro'
import { useApplyParamGroup } from '@/api/hooks/param-group'
import type { ParamGroupItem } from '@/api/model'

loadI18n()

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

  const { t } = useI18n()

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
          payload: {
            paramGroupId: paramGroupId!,
            clusterId: payload.cluster,
            reboot: payload.reboot,
          },
          options: {
            successMessage: t('message.success'),
            errorMessage: t('message.failed'),
          },
        },
        {
          onSuccess(response) {
            callbacks.onSuccess(response.data.data?.paramGroupId)

            onClose()
          },
          onError() {
            callbacks.onError()
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
