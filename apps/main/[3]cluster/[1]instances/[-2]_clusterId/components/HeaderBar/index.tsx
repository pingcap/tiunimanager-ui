import { useHistory } from 'react-router-dom'
import { useMemo } from 'react'
import { Button, message, Modal } from 'antd'
import {
  DeleteOutlined,
  DeploymentUnitOutlined,
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
import { errToMsg } from '@/utils/error'
import { DeleteConfirm } from '@/components/DeleteConfirm'
import { ClusterBackupMethod } from '@/api/model'

loadI18n()

export default function HeaderBar() {
  const history = useHistory()
  const { info, instanceResource } = useClusterContext()
  const createBackup = useCreateClusterBackup()
  const deleteCluster = useDeleteCluster()
  const queryClient = useQueryClient()
  const { t, i18n } = useI18n()

  return useMemo(() => {
    const { clusterId } = info!
    const backToList = () => history.push(resolveRoute('../'))
    const handleBackup = () => {
      createBackup.mutateAsync(
        { clusterId, backupMode: ClusterBackupMethod.manual },
        {
          onSuccess() {
            message.success(t('backup.success', { msg: clusterId }))
          },
          onSettled() {
            invalidateClusterBackups(queryClient, clusterId!)
          },
          onError(e: any) {
            message.error(
              t('backup.fail', {
                msg: errToMsg(e),
              })
            )
          },
        }
      )
    }
    const handleDelete = () => {
      deleteCluster.mutateAsync(
        { id: clusterId! },
        {
          onSuccess() {
            message.success(t('delete.success', { msg: clusterId }))
          },
          onSettled() {
            invalidateClusterDetail(queryClient, clusterId!)
          },
          onError(e: any) {
            message.error(
              t('delete.fail', {
                msg: errToMsg(e),
              })
            )
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
  ])
}
