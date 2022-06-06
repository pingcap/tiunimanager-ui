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
