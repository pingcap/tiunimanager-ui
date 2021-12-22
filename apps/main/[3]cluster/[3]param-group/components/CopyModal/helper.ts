import { useState, useCallback, useMemo } from 'react'
import { useQueryClient } from 'react-query'
import {
  invalidateParamGroupList,
  useCopyParamGroup,
} from '@/api/hooks/param-group'
import { ParamGroupItem } from '@/api/model'
import { errToMsg } from '@/utils/error'

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

  const queryClient = useQueryClient()
  const copyParamGroup = useCopyParamGroup()

  const copyAction = useCallback(
    (payload: ParamGroupCopyPayload, callbacks: CopyActionCallbacks) => {
      if (!copyId) {
        return callbacks.onError()
      }

      copyParamGroup.mutateAsync(
        {
          ...payload,
          paramGroupId: copyId,
        },
        {
          onSuccess(response) {
            callbacks.onSuccess(response.data.data?.paramGroupId)

            onClose()
          },
          onSettled() {
            return Promise.allSettled([invalidateParamGroupList(queryClient)])
          },
          onError(e: any) {
            callbacks.onError(errToMsg(e))
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
