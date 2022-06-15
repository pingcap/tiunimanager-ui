/*
 * Copyright 2022 PingCAP
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

import { useCallback, useMemo, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useQueryClient } from 'react-query'
import { Button, Form, Space, Spin, Steps } from 'antd'
import { useI18n } from '@i18n-macro'
import { resolveRoute } from '@pages-macro'
import {
  invalidateSystemInfo,
  useQueryDataCenterConfig,
  useQueryProductConfig,
  useUpdateDataCenterConfig,
  useUpdateProductConfig,
} from '@/api/hooks/platform'
import { DataCenterItemInfo, ProductItemInfo } from '@/api/model'
import { useSystemState } from '@store/system'
import DataCenterConfig from './components/DataCenter'
import ProductComponentConfig from './components/ProductComponent'
import ProductVersionConfig from './components/ProductVersion'

import styles from './index.module.less'

function useDataCenterConfig() {
  const { data, isLoading } = useQueryDataCenterConfig()
  const result = data?.data.data?.vendors || []

  return {
    loading: isLoading,
    data: result,
  }
}

function useProductConfig() {
  const { data, isLoading } = useQueryProductConfig()
  const result = data?.data.data?.products || []

  return {
    loading: isLoading,
    data: result,
  }
}

function useInitialConfig() {
  const { loading: dataCenterLoading, data: dataCenterConfig } =
    useDataCenterConfig()
  const { loading: productLoading, data: productConfig } = useProductConfig()

  return {
    loading: dataCenterLoading && productLoading,
    initialConfig: {
      dataCenter: dataCenterConfig,
      product: productConfig,
    },
  }
}

/**
 * Hook for config steps
 * @param initialStep
 */
function useSteps(initialStep = 0) {
  const [current, setCurrent] = useState(initialStep)

  const next = useCallback(() => {
    setCurrent((prev) => prev + 1)
  }, [])

  const prev = useCallback(() => {
    setCurrent((prev) => prev - 1)
  }, [])

  const { t, i18n } = useI18n()

  const stepsInfo = useMemo(
    () => [
      {
        key: 'basic',
        title: t('steps.dataCenter'),
      },
      {
        key: 'productComponent',
        title: t('steps.productComponent'),
      },
      {
        key: 'productVersion',
        title: t('steps.productVersion'),
      },
    ],
    [i18n.language]
  )

  return {
    stepsInfo,
    current,
    next,
    prev,
  }
}

enum StepIndex {
  dataCenter = 0,
  productComponent = 1,
  productVersion = 2,
}

const useActionCallbacks = () => {
  const skipInit = useSystemState((state) => state.skipInit)
  const history = useHistory()

  const backToMain = useCallback(() => {
    history.push(resolveRoute('../../'))
  }, [history])

  const onCancel = useCallback(() => {
    skipInit()
    backToMain()
  }, [skipInit, backToMain])

  return {
    onSuccess: backToMain,
    onCancel,
  }
}

const useSubmitDataCenterConfig = ({
  onSuccess,
}: {
  onSuccess: () => void
}) => {
  const { t, i18n } = useI18n()
  const updateAction = useUpdateDataCenterConfig()
  const queryClient = useQueryClient()

  const handleSubmit = useCallback(
    async (config: DataCenterItemInfo[]) => {
      try {
        await updateAction.mutateAsync({
          payload: config,
          options: {
            skipSuccessNotification: true,
            errorMessage: t('message.dataCenter.failed'),
          },
        })

        await invalidateSystemInfo(queryClient)

        onSuccess()
      } catch {
        // NOP
      }
    },
    [i18n.language, queryClient, updateAction.mutateAsync, onSuccess]
  )

  return handleSubmit
}

const useSubmitProductConfig = ({ onSuccess }: { onSuccess: () => void }) => {
  const { t, i18n } = useI18n()
  const updateAction = useUpdateProductConfig()
  const queryClient = useQueryClient()

  const handleSubmit = useCallback(
    async (config: ProductItemInfo[]) => {
      try {
        await updateAction.mutateAsync({
          payload: config,
          options: {
            skipSuccessNotification: true,
            errorMessage: t('message.product.failed'),
          },
        })

        await invalidateSystemInfo(queryClient)

        onSuccess()
      } catch {
        // NOP
      }
    },
    [i18n.language, queryClient, updateAction.mutateAsync, onSuccess]
  )

  return handleSubmit
}

export default function () {
  const { loading, initialConfig } = useInitialConfig()

  const { stepsInfo, current, next, prev } = useSteps()
  const { onSuccess: onFinishSuccess, onCancel } = useActionCallbacks()

  const [dcForm] = Form.useForm()
  const [prodCompForm] = Form.useForm()
  const [prodVerForm] = Form.useForm()

  const [prodCompConfig, setProdCompConfig] = useState<ProductItemInfo[]>()

  const submitDataCenterConfig = useSubmitDataCenterConfig({ onSuccess: next })

  const submitProductConfig = useSubmitProductConfig({
    onSuccess: onFinishSuccess,
  })

  const onDCFinish = useCallback((dcConfig: DataCenterItemInfo[]) => {
    submitDataCenterConfig(dcConfig)
  }, [])

  const onProdCompFinish = useCallback(
    (config: ProductItemInfo[]) => {
      setProdCompConfig(config)
      next()
    },
    [next]
  )

  const onProdVerFinish = useCallback(
    (prodVerConfig: ProductItemInfo[]) => {
      const finalProductConfig = initialConfig.product.map((product, idx) => {
        const { components } = prodCompConfig![idx]
        const { versions } = prodVerConfig[idx]

        return {
          ...product,
          components,
          versions,
        }
      })

      submitProductConfig(finalProductConfig)
    },
    [initialConfig.product, prodCompConfig]
  )

  const onNext = useCallback(() => {
    if (current === StepIndex.dataCenter) {
      dcForm.submit()
    } else if (current === StepIndex.productComponent) {
      prodCompForm.submit()
    }
  }, [current, dcForm, prodCompForm])

  const onFinish = useCallback(() => {
    prodVerForm.submit()
  }, [prodVerForm])

  const { t } = useI18n()

  if (loading) {
    return <Spin />
  }

  return (
    <div className={styles.layout}>
      <Steps type="navigation" current={current}>
        {stepsInfo.map((item) => (
          <Steps.Step key={item.key} title={item.title} />
        ))}
      </Steps>
      <div className={styles.content}>
        <DataCenterConfig
          className={current === StepIndex.dataCenter ? '' : styles.hidden}
          data={initialConfig.dataCenter}
          form={dcForm}
          onFinish={onDCFinish}
        />
        <ProductComponentConfig
          className={
            current === StepIndex.productComponent ? '' : styles.hidden
          }
          data={initialConfig.product}
          form={prodCompForm}
          onFinish={onProdCompFinish}
        />
        <ProductVersionConfig
          className={current === StepIndex.productVersion ? '' : styles.hidden}
          data={initialConfig.product}
          form={prodVerForm}
          onFinish={onProdVerFinish}
        />
        <Space className={styles.actionBar}>
          {current < stepsInfo.length - 1 && (
            <Button type="primary" onClick={onNext}>
              {t('actions.next')}
            </Button>
          )}
          {current === stepsInfo.length - 1 && (
            <Button type="primary" onClick={onFinish}>
              {t('actions.finish')}
            </Button>
          )}
          {current > 0 && (
            <Button onClick={prev}>{t('actions.previous')}</Button>
          )}
          <Button onClick={onCancel}>{t('actions.cancel')}</Button>
        </Space>
      </div>
    </div>
  )
}
