import { useState, useCallback, useMemo } from 'react'
import { useQueryClient } from 'react-query'
import {
  invalidateParamGroupList,
  useCopyParamGroup,
} from '@/api/hooks/param-group'
import { errToMsg } from '@/utils/error'
import { ParamGroupItem } from '@/api/model'

export interface ParamGroupCopyPayload {
  name: string
  note?: string
}

export interface CopyActionCallbacks {
  onSuccess: (msg?: string | number) => void
  onError: (msg: string) => void
}

export function useCopyModal(data?: ParamGroupItem[]) {
  const [visible, setVisible] = useState(false)

  const [copyId, setCopyId] = useState<number>()

  const copyDataSource = useMemo(() => {
    return data && copyId !== undefined
      ? data.filter((item) => item.paramGroupId === copyId)[0] ?? {}
      : {}
  }, [data, copyId])

  const onOpen = useCallback((paramGroupId: number) => {
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
    (payload: ParamGroupCopyPayload, callbacks: CopyActionCallbacks) =>
      copyParamGroup.mutateAsync(payload, {
        onSuccess(data) {
          callbacks.onSuccess(data.data.data?.paramGroupId)

          onClose()
        },
        onSettled() {
          return Promise.allSettled([invalidateParamGroupList(queryClient)])
        },
        onError(e: any) {
          callbacks.onError(errToMsg(e))
        },
      }),
    [queryClient, copyParamGroup.mutateAsync, onClose]
  )

  return {
    copyDataSource,
    visible,
    onOpen,
    onClose,
    copyAction,
  }
}
