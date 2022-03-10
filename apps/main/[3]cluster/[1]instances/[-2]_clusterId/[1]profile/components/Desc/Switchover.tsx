import { useCallback, useMemo } from 'react'
import { useQueryClient } from 'react-query'
import { Form, Modal, Space, Switch } from 'antd'
import { loadI18n, useI18n } from '@i18n-macro'
import { ClusterRelations } from '@/api/model'
import {
  invalidateClusterDetail,
  useSwitchoverClusterRole,
} from '@/api/hooks/cluster'

import styles from './index.module.less'

loadI18n()

export function useClusterRoleSwitchover(
  clusterId: string,
  relations: ClusterRelations
) {
  const { masters, slaves } = relations

  const isCurrentSlave = !!masters?.length
  const masterClusterId = masters?.[0]

  const { t, i18n } = useI18n()

  const role = useMemo(() => {
    if (isCurrentSlave) {
      return t('roles.slave')
    } else if (slaves?.length) {
      return t('roles.master')
    } else {
      return '-'
    }
  }, [i18n.language, slaves, isCurrentSlave])

  const [switchoverForm] = Form.useForm<{ forced: boolean }>()
  const queryClient = useQueryClient()
  const switchoverClusterRole = useSwitchoverClusterRole()

  const doMasterSwitchover = useCallback(
    async (
      orginMasterCluster: string,
      newMasterCluster: string,
      forced: boolean
    ) => {
      try {
        await switchoverClusterRole.mutateAsync({
          payload: {
            sourceClusterId: orginMasterCluster,
            targetClusterId: newMasterCluster,
            forced,
          },
          options: {
            successMessage: t('message.switchover.success'),
            errorMessage: t('message.switchover.failed'),
          },
        })

        return invalidateClusterDetail(queryClient, newMasterCluster)
      } catch (e) {
        // NOP
      }
    },
    [i18n.language, queryClient, switchoverClusterRole.mutateAsync]
  )

  const onSwitchover = useCallback(async () => {
    if (!clusterId || !masterClusterId) {
      return
    }

    try {
      await switchoverClusterRole.mutateAsync({
        payload: {
          sourceClusterId: masterClusterId,
          targetClusterId: clusterId,
          checkOnly: true,
        },
        options: {
          skipSuccessNotification: true,
          errorMessage: t('message.switchoverCheck.failed'),
        },
      })

      Modal.confirm({
        title: t('switchover.title'),
        icon: null,
        okText: t('switchover.actions.confirm'),
        content: (
          <>
            <div className={styles.switchoverContent}>
              <Space size="middle">
                <span>{t('switchover.content.origin')}: </span>
                <span>{masterClusterId}</span>
              </Space>
              <Space size="middle">
                <span>{t('switchover.content.new')}: </span>
                <span>{clusterId}</span>
              </Space>
            </div>
            <Form
              form={switchoverForm}
              colon={false}
              requiredMark={false}
              labelAlign="left"
              initialValues={{
                forced: false,
              }}
            >
              <Form.Item
                name="forced"
                label={t('switchover.options.forced')}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Form>
          </>
        ),
        onCancel() {
          switchoverForm.resetFields()
        },
        async onOk() {
          const forced = switchoverForm.getFieldValue('forced')

          return await doMasterSwitchover(masterClusterId, clusterId, forced)
        },
      })
    } catch (e) {
      // NOP
    }
  }, [
    i18n.language,
    switchoverClusterRole.mutateAsync,
    clusterId,
    masterClusterId,
    switchoverForm,
  ])

  return {
    isCurrentSlave,
    role,
    onSwitchover,
  }
}
