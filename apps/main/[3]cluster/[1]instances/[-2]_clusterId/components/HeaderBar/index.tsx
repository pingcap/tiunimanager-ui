import { useHistory } from 'react-router-dom'
import { useMemo } from 'react'
import { Button, Form, Modal, Switch } from 'antd'
import {
  DeleteOutlined,
  DeploymentUnitOutlined,
  ExclamationCircleOutlined,
  SaveOutlined,
} from '@ant-design/icons'
import { CopyIconButton } from '@/components/CopyToClipboard'
import styles from './index.module.less'
import { useClusterContext } from '@apps/main/[3]cluster/[1]instances/[-2]_clusterId/context'
import {
  invalidateClusterBackups,
  invalidateClusterDetail,
  useCreateClusterBackup,
  useDeleteCluster,
} from '@/api/hooks/cluster'
import { resolveRoute } from '@pages-macro'
import { useQueryClient } from 'react-query'
import Header from '@/components/Header'
import { loadI18n, useI18n } from '@i18n-macro'
import { DeleteConfirm } from '@/components/DeleteConfirm'
import { ClusterBackupMethod } from '@/api/model'
import { useErrorNotification } from '@/components/ErrorNotification'

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
          clusterId,
          backupMode: ClusterBackupMethod.manual,
          options: {
            actionName: t('backup.name'),
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
          return new Promise((resolve, reject) => {
            deleteCluster.mutateAsync(
              {
                payload: {
                  id: clusterId!,
                  autoBackup: payload.autoBackup,
                  keepExistingBackupData: payload.keepExistingBackupData,
                  force: true,
                },
                options: {
                  actionName: t('forceDelete.name'),
                },
              },
              {
                onSuccess(resp) {
                  resolve(resp.data?.data)

                  backToList()
                },
                onError() {
                  reject()
                },
                onSettled() {
                  invalidateClusterDetail(queryClient, clusterId!)
                },
              }
            )
          })
        },
      })
    }

    const handleDelete = (closeConfirm: () => void) => {
      const reqPayload = {
        autoBackup: deletionForm.getFieldValue('autoBackup'),
        keepExistingBackupData:
          deletionForm.getFieldValue('keepExistingBackup'),
      }

      deleteCluster.mutateAsync(
        {
          payload: {
            id: clusterId!,
            ...reqPayload,
          },
          options: {
            actionName: t('delete.name'),
            skipErrorNotification: true,
          },
        },
        {
          onSuccess() {
            closeConfirm()

            backToList()
          },
          onError(error: any) {
            if (error?.response?.status === 409) {
              handleForceDelete(reqPayload)
            } else {
              useErrorNotification(error)
            }

            closeConfirm()
          },
          onSettled() {
            invalidateClusterDetail(queryClient, clusterId!)
          },
        }
      )
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
        title={t('delete.confirm')}
        content={
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
            <div className="ant-form-item-extra">
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
        }
        confirmInput={{
          expect: 'delete',
        }}
        onConfirm={handleDelete}
      >
        <Button danger>
          <DeleteOutlined /> {t('actions.delete')}
        </Button>
      </DeleteConfirm>
    )

    const actions = [scaleOutBtn, backupBtn, deleteBtn]
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
