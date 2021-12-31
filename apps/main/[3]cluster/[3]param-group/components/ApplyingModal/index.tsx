import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { loadI18n, useI18n } from '@i18n-macro'
import { TFunction } from 'react-i18next'
import { Form, Modal, message, Switch, Table } from 'antd'
import { useQueryClustersList } from '@/api/hooks/cluster'
import {
  ParamGroupItem,
  ClusterInfo,
  ParamGroupDBType,
  ClusterStatus,
} from '@/api/model'
import { isArray } from '@/utils/types'
import type {
  ParamGroupApplyingPayload,
  ApplyingActionCallbacks,
} from './helper'

loadI18n()

type ApplyingFormFields = ParamGroupApplyingPayload

interface ParamGroupApplyingModalProps {
  visible: boolean
  dataSource: ParamGroupItem
  onConfirm: (
    values: ApplyingFormFields,
    callbacks: ApplyingActionCallbacks
  ) => void
  onCancel: () => void
}

const ParamGroupApplyingModal: FC<ParamGroupApplyingModalProps> = ({
  visible,
  dataSource,
  onConfirm,
  onCancel,
}) => {
  const { t, i18n } = useI18n()

  const [form] = Form.useForm<ApplyingFormFields>()

  const [confirmLoading, setConfirmLoading] = useState(false)

  const onSuccess = useCallback(() => {
    message.success(t('message.success')).then()

    setConfirmLoading(false)
  }, [i18n.language])

  const onError = useCallback(
    (msg?: string) => {
      message
        .error(
          t('message.fail', {
            msg,
          })
        )
        .then()

      setConfirmLoading(false)
    },
    [i18n.language]
  )

  const { data: clusterList, isLoading: clusterLoading } =
    useFetchAvalibleClusterList({
      dbType: dataSource.dbType,
      dbVersion: dataSource.clusterVersion,
    })

  const onOk = useCallback(async () => {
    setConfirmLoading(true)

    try {
      const values = await form.validateFields()

      onConfirm(values, {
        onSuccess,
        onError,
      })
    } catch (e) {
      // error
      setConfirmLoading(false)
    }
  }, [form, onSuccess, onError, onConfirm])

  useEffect(() => {
    if (visible) {
      form.resetFields()
    }
  }, [form, visible])

  return (
    <Modal
      width={600}
      visible={visible}
      title={t('modal.title')}
      okText={t('footer.ok.text')}
      cancelText={t('footer.cancel.text')}
      onCancel={onCancel}
      onOk={onOk}
      confirmLoading={confirmLoading}
    >
      <Form
        form={form}
        colon={false}
        requiredMark={false}
        initialValues={{
          reboot: true,
        }}
      >
        <Form.Item
          name="cluster"
          label={t('form.fields.cluster')}
          rules={[
            { required: true, message: t('form.rules.cluster.required') },
          ]}
        >
          <FormItemCluster dataSource={clusterList} loading={clusterLoading} />
        </Form.Item>
        <Form.Item
          name="reboot"
          label={t('form.fields.reboot')}
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  )
}

/**
 * Hook for getting cluster list that can be
 * used for applying a parameter group
 */
function useFetchAvalibleClusterList({
  dbType: dbTypeCode,
  dbVersion,
}: {
  dbType?: ParamGroupDBType
  dbVersion?: string
}) {
  const dbType = useMemo(() => {
    const hashmap = {
      [ParamGroupDBType.tidb]: 'TiDB',
      [ParamGroupDBType.dm]: 'DM',
    }

    return dbTypeCode ? hashmap[dbTypeCode] : undefined
  }, [dbTypeCode])

  const { data, isLoading } = useQueryClustersList(
    {
      type: dbType,
    },
    {
      keepPreviousData: true,
      enabled: !!dbType,
    }
  )
  const clusterList = data?.data.data?.clusters

  const filteredList = useMemo(() => {
    // const majorDBVerion = parseInt(dbVersion ?? '')

    if (!dbType || !isArray(clusterList)) {
      return []
    }

    return clusterList.filter((item) => {
      const { clusterType, status } = item

      // only online clusters and offline clusters avaliable
      return (
        clusterType &&
        // parseInt(clusterVersion ?? '') >= majorDBVerion &&
        (status === ClusterStatus.stopped || status === ClusterStatus.running)
      )
    })
  }, [dbType, dbVersion, clusterList])

  return {
    isLoading,
    data: filteredList,
  }
}

interface FormItemClusterProps {
  value?: string
  onChange?: (clusterId: string | number) => void
  dataSource: ClusterInfo[]
  loading: boolean
}

const FormItemCluster: FC<FormItemClusterProps> = ({
  value,
  onChange: onValueChange,
  dataSource,
  loading,
}) => {
  const { t, i18n } = useI18n()
  const columns = useMemo(() => getColumns(t), [i18n.language])

  return (
    <Table<ClusterInfo>
      loading={loading}
      rowSelection={{
        type: 'radio',
        selectedRowKeys: value ? [value] : [],
        getCheckboxProps(record) {
          return { id: record.clusterId }
        },
        onChange(selectedKeys) {
          const key = selectedKeys[0]
          onValueChange?.(key)
        },
      }}
      dataSource={dataSource}
      columns={columns}
      rowKey="clusterId"
    />
  )
}

function getColumns(t: TFunction<''>) {
  return [
    {
      title: 'ID',
      width: 180,
      dataIndex: 'clusterId',
      key: 'id',
    },
    {
      title: t('model:cluster.property.name'),
      width: 120,
      dataIndex: 'clusterName',
      key: 'name',
    },
    {
      title: t('model:cluster.property.type'),
      width: 80,
      dataIndex: 'clusterType',
      key: 'type',
    },
    {
      title: t('model:cluster.property.version'),
      width: 80,
      dataIndex: 'clusterVersion',
      key: 'version',
    },
  ]
}

export default ParamGroupApplyingModal