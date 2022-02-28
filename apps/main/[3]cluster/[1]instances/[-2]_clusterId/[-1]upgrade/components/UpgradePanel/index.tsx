import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useQueryClient } from 'react-query'
import { TFunction } from 'react-i18next'
import { loadI18n, useI18n } from '@i18n-macro'
import {
  Steps,
  Button,
  Form,
  Radio,
  Space,
  Spin,
  Select,
  Input,
  FormInstance,
  Table,
  TableColumnsType,
} from 'antd'
import { ProColumns } from '@ant-design/pro-table'
import HeavyTable from '@/components/HeavyTable'
import {
  ClusterInfo,
  ClusterUpgradeType,
  ClusterUpgradeMethod,
  ClusterUpgradeParamDiffItem,
} from '@/api/model'
import {
  useQueryClusterUpgradePath,
  useQueryClusterUpgradeDiff,
  useUpgradeCluster,
  invalidateClustersList,
  invalidateClusterDetail,
} from '@/api/hooks/cluster'

import styles from './index.module.less'

loadI18n()

type BasicFormFields = {
  targetVersion: string
  upgradeType: ClusterUpgradeType
  upgradeMethod: ClusterUpgradeMethod
}

interface BasicConfigProps {
  className?: string
  cluster: ClusterInfo
  form: FormInstance<BasicFormFields>
  onFinish: (values: BasicFormFields) => void
}

const BasicConfig: FC<BasicConfigProps> = ({
  className,
  cluster,
  form,
  onFinish,
}) => {
  const { t } = useI18n()

  const { data: versions, isLoading } = useFetchTargetVersionData(
    cluster.clusterId!
  )

  if (isLoading) {
    return <Spin />
  }

  return (
    <Form
      hideRequiredMark
      scrollToFirstError
      colon={false}
      layout="vertical"
      name="basic"
      className={className}
      form={form}
      initialValues={{
        upgradeType: ClusterUpgradeType.inPlace,
        upgradeMethod: ClusterUpgradeMethod.online,
      }}
      onFinish={onFinish}
    >
      <Form.Item label={t('basic.fields.clusterId')}>
        <Input disabled value={cluster.clusterId} />
      </Form.Item>
      <Form.Item label={t('basic.fields.clusterName')}>
        <Input disabled value={cluster.clusterName} />
      </Form.Item>
      <Form.Item label={t('basic.fields.currentVersion')}>
        <Input disabled value={cluster.clusterVersion} />
      </Form.Item>
      <Form.Item
        name="targetVersion"
        label={t('basic.fields.targetVersion')}
        rules={[
          { required: true, message: t('basic.rules.targetVersion.required') },
        ]}
      >
        <Select>
          {versions?.map((version) => (
            <Select.Option key={version} value={version}>
              {version}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      {/* TODO: support Migration Data Upgrade */}
      <Form.Item name="upgradeType" label={t('basic.fields.upgradeType')}>
        <Radio.Group>
          <Radio value={ClusterUpgradeType.inPlace}>
            {t('model:clusterUpgrade.upgradeType.inPlace')}
          </Radio>
        </Radio.Group>
      </Form.Item>
      {/* TODO: use form item with "shouldUpdate" prop */}
      <Form.Item name="upgradeMethod" label={t('basic.fields.upgradeMethod')}>
        <Radio.Group>
          <Radio value={ClusterUpgradeMethod.online}>
            {t('model:clusterUpgrade.upgradeMethod.online')}
          </Radio>
          <Radio value={ClusterUpgradeMethod.offline}>
            {t('model:clusterUpgrade.upgradeMethod.offline')}
          </Radio>
        </Radio.Group>
      </Form.Item>
    </Form>
  )
}

/**
 * Query cluster target version list
 * @param clusterId Cluster ID
 */
function useFetchTargetVersionData(clusterId: string) {
  const { data, isLoading } = useQueryClusterUpgradePath(
    {
      clusterId,
    },
    { refetchOnWindowFocus: false }
  )

  const versions = data?.data?.data?.paths?.[0]?.versions
  // const versions = ['v5.3.0', 'v5.4.0']

  return {
    data: versions,
    isLoading,
  }
}

/**
 * Query diffenent parameters
 * @param clusterId Cluster ID
 * @param targetVersion Target cluster version
 */
function useFetchDiffParams(clusterId: string, targetVersion?: string) {
  const { data, isLoading } = useQueryClusterUpgradeDiff(
    {
      clusterId,
      targetVersion: targetVersion!,
    },
    {
      refetchOnWindowFocus: false,
      enabled: !!targetVersion,
    }
  )

  const result = data?.data?.data?.configDiffInfos

  return {
    data: result,
    isLoading,
  }
}

/**
 * Get parameters config columns
 * @param t react-i18n translation instance
 */
function getParamsConfigColumns(t: TFunction<''>) {
  const columns: ProColumns<ClusterUpgradeParamDiffItem>[] = [
    {
      title: t('model:clusterParam.property.component'),
      width: 100,
      dataIndex: 'instanceType',
      key: 'instanceType',
      editable: false,
    },
    {
      title: t('model:clusterParam.property.category'),
      width: 120,
      dataIndex: 'category',
      key: 'category',
      editable: false,
    },
    {
      title: t('model:clusterParam.property.name'),
      width: 180,
      dataIndex: 'name',
      key: 'name',
      editable: false,
    },
    {
      title: t('paramsConfig.columns.currentValue'),
      width: 120,
      dataIndex: 'currentValue',
      key: 'currentValue',
      editable: false,
    },
    {
      title: t('paramsConfig.columns.newValue'),
      width: 120,
      dataIndex: 'suggestValue',
      key: 'suggestValue',
      editable: false,
    },
    {
      title: t('paramsConfig.columns.pick'),
      width: 120,
      key: 'final',
      dataIndex: 'suggestValue',
      valueType: 'radio',
      fieldProps: (form, { entity }) => {
        return {
          options: [
            {
              label: t('paramsConfig.columns.currentValue'),
              value: entity.currentValue,
            },
            {
              label: t('paramsConfig.columns.newValue'),
              value: entity.suggestValue,
            },
          ],
        }
      },
      formItemProps: () => {
        return {
          required: true,
        }
      },
    },
  ]

  return columns
}

type ParamPreiewItem = ClusterUpgradeParamDiffItem & { final: string }

interface ParamsConfigProps {
  className?: string
  loading: boolean
  data?: ClusterUpgradeParamDiffItem[]
  onChange: (data: ParamPreiewItem[]) => void
}

const ParamsConfig: FC<ParamsConfigProps> = ({
  className,
  loading,
  data,
  onChange,
}) => {
  const { t, i18n } = useI18n()

  const columns = useMemo(() => getParamsConfigColumns(t), [i18n.language])

  const editableKeys = useMemo(() => {
    return !loading && data ? data.map((item) => item.paramId) : []
  }, [data, loading])

  const [editForm] = Form.useForm<ClusterUpgradeParamDiffItem>()

  useEffect(() => {
    if (!loading && data) {
      const configData = data.map((item) => ({
        ...item,
        final: item.suggestValue,
      }))

      onChange(configData)
    }
  }, [data, loading])

  useEffect(() => {
    if (!loading && data) {
      editForm.resetFields()
    }
  }, [data, loading, editForm])

  return (
    <HeavyTable
      className={className}
      loading={loading}
      dataSource={data}
      tooltip={false}
      columns={columns}
      pagination={false}
      options={{
        density: false,
        fullScreen: false,
        setting: false,
        reload: false,
      }}
      rowKey="paramId"
      scroll={{ y: 600 }}
      editable={{
        type: 'multiple',
        editableKeys,
        form: editForm,
        onValuesChange: (record, dataSource) => {
          onChange(dataSource as ParamPreiewItem[])
        },
      }}
    />
  )
}

/**
 * Get parameters preview columns
 * @param t react-i18n translation instance
 */
function getParamsPreviewColumns(t: TFunction<''>) {
  const columns: TableColumnsType<ParamPreiewItem> = [
    {
      title: t('model:clusterParam.property.component'),
      width: 100,
      dataIndex: 'instanceType',
      key: 'instanceType',
    },
    {
      title: t('model:clusterParam.property.category'),
      width: 120,
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: t('model:clusterParam.property.name'),
      width: 180,
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('paramsConfig.columns.final'),
      width: 120,
      key: 'final',
      dataIndex: 'final',
    },
  ]

  return columns
}

interface ConfigPreviewProps {
  className?: string
  data?: ParamPreiewItem[]
}

const ConfigPreview: FC<ConfigPreviewProps> = ({ className, data }) => {
  const { t, i18n } = useI18n()

  const columns = useMemo(() => getParamsPreviewColumns(t), [i18n.language])

  return (
    <Table
      className={className}
      dataSource={data}
      pagination={false}
      rowKey="paramId"
      columns={columns}
      scroll={{ y: 600 }}
    />
  )
}

/**
 * Hook for "Steps"
 */
function useSteps() {
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => {
    setCurrent((prev) => prev + 1)
  }, [])

  const prev = useCallback(() => {
    setCurrent((prev) => prev - 1)
  }, [])

  const { t, i18n } = useI18n()

  const stepsConfig = useMemo(
    () => [
      {
        key: 'basic',
        title: t('steps.basic'),
      },
      {
        key: 'paramsConfig',
        title: t('steps.paramsConfig'),
      },
      {
        key: 'preview',
        title: t('steps.preview'),
      },
    ],
    [i18n.language]
  )

  return {
    stepsConfig,
    current,
    next,
    prev,
  }
}

enum StepIndex {
  basic = 0,
  paramsConfig = 1,
  preview = 2,
}

interface UpgradePanelProps {
  cluster: ClusterInfo
  back: () => void
}

const UpgradePanel: FC<UpgradePanelProps> = ({ back, cluster }) => {
  const { stepsConfig, current, next, prev } = useSteps()

  const [basicValues, setBasicValues] = useState<BasicFormFields>()
  const [basicForm] = Form.useForm<BasicFormFields>()

  const { data: paramDiffList, isLoading: paramLoading } = useFetchDiffParams(
    cluster.clusterId!,
    basicValues?.targetVersion
  )

  const onBasicFinish = useCallback(
    (values: BasicFormFields) => {
      setBasicValues(values)
      next()
    },
    [next]
  )

  const [editedParamsData, setEditedParamsData] = useState<ParamPreiewItem[]>()

  const onParamsChange = useCallback((data: ParamPreiewItem[]) => {
    setEditedParamsData(data)
  }, [])

  const onNextClick = useCallback(() => {
    if (current === StepIndex.basic) {
      return basicForm.submit()
    } else if (current === StepIndex.paramsConfig) {
      next()
    }
  }, [current, basicForm, next])

  const { t, i18n } = useI18n()

  const queryClient = useQueryClient()
  const upgradeCluster = useUpgradeCluster()
  const onConfirm = useCallback(() => {
    if (!cluster.clusterId || !basicValues || !editedParamsData) {
      return
    }

    const { clusterId } = cluster

    return upgradeCluster.mutateAsync(
      {
        payload: {
          clusterId: clusterId,
          targetVersion: basicValues.targetVersion,
          upgradeType: basicValues.upgradeType as any,
          upgradeWay: basicValues.upgradeMethod,
          configs: editedParamsData.map((item) => ({
            instanceType: item.instanceType,
            name: item.name,
            paramId: item.paramId,
            value: item.final,
          })),
        },
        options: {
          successMessage: t('message.success'),
          errorMessage: t('message.failed'),
        },
      },
      {
        onSuccess() {
          back()
        },
        onSettled() {
          return Promise.allSettled([
            invalidateClustersList(queryClient),
            invalidateClusterDetail(queryClient, clusterId),
          ])
        },
      }
    )
  }, [
    i18n.language,
    queryClient,
    upgradeCluster.mutateAsync,
    back,
    cluster,
    basicValues,
    editedParamsData,
  ])

  return (
    <div className={styles.panel}>
      <Steps type="navigation" current={current}>
        {stepsConfig.map((item) => (
          <Steps.Step key={item.key} title={item.title} />
        ))}
      </Steps>
      <div className={styles.container}>
        <div className={styles.content}>
          <BasicConfig
            className={current === StepIndex.basic ? '' : styles.hidden}
            cluster={cluster}
            form={basicForm}
            onFinish={onBasicFinish}
          />
          <ParamsConfig
            className={current === StepIndex.paramsConfig ? '' : styles.hidden}
            loading={paramLoading}
            data={paramDiffList}
            onChange={onParamsChange}
          />
          <ConfigPreview
            className={current === StepIndex.preview ? '' : styles.hidden}
            data={editedParamsData}
          />
        </div>
        <Space>
          {current < stepsConfig.length - 1 && (
            <Button type="primary" onClick={onNextClick}>
              {t('actions.next')}
            </Button>
          )}
          {current === stepsConfig.length - 1 && (
            <Button type="primary" onClick={onConfirm}>
              {t('actions.confirm')}
            </Button>
          )}
          {current > 0 && (
            <Button onClick={prev}>{t('actions.previous')}</Button>
          )}
          <Button onClick={back}>{t('actions.cancel')}</Button>
        </Space>
      </div>
    </div>
  )
}

export default UpgradePanel
