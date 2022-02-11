import { useState, useCallback, useMemo } from 'react'
import { useQueryClient } from 'react-query'
import {
  invalidateParamGroupList,
  useCopyParamGroup,
} from '@/api/hooks/param-group'
import { ParamGroupItem } from '@/api/model'
import { loadI18n, useI18n } from '@i18n-macro'

loadI18n()
export interface ParamGroupCopyPayload {
  name: string
  note?: string
}

export interface CopyActionCallbacks {
  onSuccess: (msg?: string | number) => void
  onError: (msg?: string) => void
}

export function useCopyModal(dataSource?: ParamGroupItem[]) {
  const [visible, setVisible] = useState(false)

  const [copyId, setCopyId] = useState<string>()

  const copyData = useMemo(() => {
    return dataSource && copyId
      ? dataSource.filter((item) => item.paramGroupId === copyId)[0] ?? {}
      : {}
  }, [dataSource, copyId])

  const onOpen = useCallback((paramGroupId: string) => {
    setCopyId(paramGroupId)
    setVisible(true)
  }, [])
  const onClose = useCallback(() => {
    setVisible(false)
    setCopyId(undefined)
  }, [])

  const { t } = useI18n()
  const queryClient = useQueryClient()
  const copyParamGroup = useCopyParamGroup()

  const copyAction = useCallback(
    (payload: ParamGroupCopyPayload, callbacks: CopyActionCallbacks) => {
      if (!copyId) {
        return callbacks.onError()
      }

      copyParamGroup.mutateAsync(
        {
          payload: {
            ...payload,
            paramGroupId: copyId,
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
          onSettled() {
            return Promise.allSettled([invalidateParamGroupList(queryClient)])
          },
          onError() {
            callbacks.onError()
          },
        }
      )
    },
    [queryClient, copyParamGroup.mutateAsync, onClose, copyId]
  )

  return {
    copyData,
    visible,
    onOpen,
    onClose,
    copyAction,
  }
}
