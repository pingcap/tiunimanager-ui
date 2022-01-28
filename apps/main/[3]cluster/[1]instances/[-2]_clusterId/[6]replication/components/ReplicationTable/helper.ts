import { useCallback } from 'react'
import { useQueryClient } from 'react-query'
import { loadI18n, useI18n } from '@i18n-macro'
import { message } from 'antd'
import {
  invalidateClusterDataReplicationList,
  useDeleteClusterDataReplication,
  useResumeClusterDataReplication,
  useSuspendClusterDataReplication,
} from '@/api/hooks/cluster'

loadI18n()

/**
 * Hook for suspending a data replication task
 */
export function useSuspendReplicationTask() {
  const { t, i18n } = useI18n()
  const queryClient = useQueryClient()

  const suspendTask = useSuspendClusterDataReplication()

  const suspendAction = useCallback(
    (id: string) => {
      const hide = message.loading(t('suspend.loading'), 0)

      return suspendTask.mutateAsync(
        {
          payload: { id },
          options: {
            successMessage: t('suspend.success'),
            errorMessage: t('suspend.failed'),
          },
        },
        {
          onSettled() {
            hide()

            return invalidateClusterDataReplicationList(queryClient)
          },
        }
      )
    },
    [i18n.language, queryClient, suspendTask.mutateAsync]
  )

  return suspendAction
}

/**
 * Hook for resuming a data replication task
 */
export function useResumeReplicationTask() {
  const { t, i18n } = useI18n()
  const queryClient = useQueryClient()

  const resumeTask = useResumeClusterDataReplication()

  const resumeAction = useCallback(
    (id: string) => {
      const hide = message.loading(t('resume.loading'), 0)

      return resumeTask.mutateAsync(
        {
          payload: { id },
          options: {
            successMessage: t('resume.success'),
            errorMessage: t('resume.failed'),
          },
        },
        {
          onSettled() {
            hide()

            return invalidateClusterDataReplicationList(queryClient)
          },
        }
      )
    },
    [i18n.language, queryClient, resumeTask.mutateAsync]
  )

  return resumeAction
}

/**
 * Hook for deleting a data replication task
 */
export function useDeleteReplicationTask() {
  const { t, i18n } = useI18n()
  const queryClient = useQueryClient()

  const deleteTask = useDeleteClusterDataReplication()

  const deleteAction = useCallback(
    (id: string) => {
      const hide = message.loading(t('delete.loading'), 0)

      return deleteTask.mutateAsync(
        {
          payload: { id },
          options: {
            successMessage: t('delete.success'),
            errorMessage: t('delete.failed'),
          },
        },
        {
          onSettled() {
            hide()

            return invalidateClusterDataReplicationList(queryClient)
          },
        }
      )
    },
    [i18n.language, queryClient, deleteTask.mutateAsync]
  )

  return deleteAction
}
