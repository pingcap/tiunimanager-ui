import { useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import { useQueryClient } from 'react-query'
import { loadI18n, useI18n } from '@i18n-macro'
import { resolveRoute } from '@pages-macro'
import { Button, Form, Modal, Switch } from 'antd'
import {
  DeleteOutlined,
  DeploymentUnitOutlined,
  ExclamationCircleOutlined,
  ForkOutlined,
  SaveOutlined,
} from '@ant-design/icons'
import {
  invalidateClusterBackups,
  invalidateClusterDetail,
  useCreateClusterBackup,
  useDeleteCluster,
} from '@/api/hooks/cluster'
import { CopyIconButton } from '@/components/CopyToClipboard'
import Header from '@/components/Header'
import { DeleteConfirm } from '@/components/DeleteConfirm'
import { useErrorNotification } from '@/components/ErrorNotification'
import { ClusterBackupMethod } from '@/api/model'
import { useClusterContext } from '@apps/main/[3]cluster/[1]instances/[-2]_clusterId/context'

import styles from './index.module.less'

loadI18n()

export default function HeaderBar() {
  const history = useHistory()
  const { info, instanceResource } = useClusterContext()
  const createBackup = useCreateClusterBackup()
  const deleteCluster = useDeleteCluster()
  const queryClient = useQueryClient()
  const { t, i18n } = useI18n()
  const [deletionForm] = Form.useForm()

  return useMemo(() => {
    const { clusterId } = info!
    const backToList = () => history.push(resolveRoute('../'))
    const handleBackup = () => {
      createBackup.mutateAsync(
        {
          payload: {
            clusterId,
            backupMode: ClusterBackupMethod.manual,
          },
          options: {
            successMessage: t('backup.success'),
            errorMessage: t('backup.failed'),
          },
        },
        {
          onSettled() {
            invalidateClusterBackups(queryClient, clusterId!)
          },
        }
      )
    }

    const handleForceDelete = (payload: {
      autoBackup: boolean
      keepExistingBackupData: boolean
    }) => {
      Modal.confirm({
        title: t('forceDelete.confirm'),
        icon: <ExclamationCircleOutlined />,
        content: t('forceDelete.tips'),
        okType: 'danger',
        async onOk() {
          try {
            await deleteCluster.mutateAsync({
              payload: {
                id: clusterId!,
                autoBackup: payload.autoBackup,
                keepExistingBackupData: payload.keepExistingBackupData,
                force: true,
              },
              options: {
                successMessage: t('forceDelete.success'),
                errorMessage: t('forceDelete.failed'),
              },
            })

            backToList()
          } catch {
            return
          } finally {
            invalidateClusterDetail(queryClient, clusterId!)
          }
        },
      })
    }

    const handleDelete = async (closeConfirm: () => void) => {
      const reqPayload = {
        autoBackup: deletionForm.getFieldValue('autoBackup'),
        keepExistingBackupData:
          deletionForm.getFieldValue('keepExistingBackup'),
      }

      try {
        await deleteCluster.mutateAsync({
          payload: {
            id: clusterId!,
            ...reqPayload,
          },
          options: {
            successMessage: t('delete.success'),
            skipErrorNotification: true,
          },
        })

        closeConfirm()
        backToList()
      } catch (error: any) {
        if (error?.response?.status === 409) {
          handleForceDelete(reqPayload)
        } else {
          useErrorNotification(error)
        }

        closeConfirm()
        deletionForm.resetFields()
      } finally {
        invalidateClusterDetail(queryClient, clusterId!)
      }
    }

    const handleScaleOut = () =>
      history.push({
        pathname: resolveRoute('../scale'),
        state: {
          cluster: info,
          topology: instanceResource,
          from: history.location.pathname,
        },
      })

    const handleClone = () =>
      history.push({
        pathname: resolveRoute('../clone'),
        state: {
          cluster: info,
          from: history.location.pathname,
        },
      })

    const cloneBtn = (
      <Button key="clone" onClick={handleClone} disabled={!info?.clusterId}>
        <ForkOutlined /> {t('actions.clone')}
      </Button>
    )

    const scaleOutBtn = (
      <Button
        key="scaleOut"
        onClick={handleScaleOut}
        disabled={!instanceResource}
      >
        <DeploymentUnitOutlined /> {t('actions.scaleOut')}
      </Button>
    )
    const backupBtn = (
      <Button
        key="backup"
        onClick={() => {
          Modal.confirm({
            content: t('backup.confirm', { name: clusterId! }),
            onOk: handleBackup,
          })
        }}
        disabled={!instanceResource}
      >
        <SaveOutlined /> {t('actions.backup')}
      </Button>
    )
    const deleteBtn = (
      <DeleteConfirm
        key="delete"
        title={t('delete.title')}
        content={
          <>
            <Form
              className={styles.deletionForm}
              form={deletionForm}
              colon={false}
              requiredMark={false}
              labelAlign="left"
              initialValues={{
                autoBackup: true,
                keepExistingBackup: true,
              }}
            >
              <Form.Item
                className={styles.noMessageItem}
                name="autoBackup"
                label={t('delete.options.autoBackup')}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <div className={styles.itemNote}>
                {t('delete.note.autoBackup')}
              </div>
              <Form.Item
                name="keepExistingBackup"
                label={t('delete.options.keepExistingBackup')}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Form>
            <div>{t('delete.confirm')}</div>
          </>
        }
        confirmInput={{
          expect: 'delete',
        }}
        onCancel={() => deletionForm.resetFields()}
        onConfirm={handleDelete}
      >
        <Button danger>
          <DeleteOutlined /> {t('actions.delete')}
        </Button>
      </DeleteConfirm>
    )

    const actions = [cloneBtn, scaleOutBtn, backupBtn, deleteBtn]
    return (
      <Header
        onBack={backToList}
        className={styles.header}
        title={t('title')}
        subTitle={
          <>
            <CopyIconButton
              text={clusterId!}
              label={t('model:cluster.property.id')}
            />{' '}
            ID: {clusterId}
          </>
        }
        extra={actions}
      />
    )
  }, [
    info,
    createBackup.mutateAsync,
    deleteCluster.mutateAsync,
    i18n.language,
    history,
    queryClient,
    deletionForm,
  ])
}
