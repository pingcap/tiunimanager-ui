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

import { FC, useCallback, useEffect, useMemo } from 'react'
import { Card, Form, FormInstance, Checkbox } from 'antd'
import { DatabaseOutlined } from '@ant-design/icons'
import { loadI18n, useI18n } from '@i18n-macro'
import { ProductItemInfo, HardwareArch } from '@/api/model'
import { useSystemState } from '@store/system'

import styles from './index.module.less'

loadI18n()

type ProdVerField = {
  arch: {
    amd64: string[]
    arm64: string[]
  }
}

interface ProductVersionConfigProps {
  className?: string
  data: ProductItemInfo[]
  form: FormInstance<ProdVerField[]>
  onFinish: (values: ProductItemInfo[]) => void
}

const ProductVersionConfig: FC<ProductVersionConfigProps> = ({
  className,
  data,
  form,
  onFinish,
}) => {
  const { t } = useI18n()

  const allVersions = useSystemState((state) => state.initOptions.prodVersions)

  const initialData = useMemo(() => {
    const ret = data.map((product) => {
      const amd64Versions = product.versions
        ?.filter((item) => item.arch === HardwareArch.x86_64)
        .map((item) => item.version!)
      const arm64Versions = product.versions
        ?.filter((item) => item.arch === HardwareArch.arm64)
        .map((item) => item.version!)

      return {
        productId: product.productId,
        productName: product.productName,
        arch: {
          amd64: amd64Versions,
          arm64: arm64Versions,
        },
      }
    })

    return ret
  }, [data])

  const handleFinish = useCallback(
    (fieldValues: { [k: number]: ProdVerField }) => {
      const mergedValues = initialData.map((product, idx) => {
        const { amd64: amd64Vers = [], arm64: arm64Vers = [] } =
          fieldValues[idx]?.arch || {}
        const amd64VerConfig = amd64Vers.map((version) => ({
          productId: product.productId,
          arch: 'X86_64',
          version,
        }))
        const arm64VerConfig = arm64Vers.map((version) => ({
          productId: product.productId,
          arch: 'ARM64',
          version,
        }))

        return {
          productId: product.productId,
          productName: product.productName,
          versions: amd64VerConfig.concat(arm64VerConfig),
        }
      })

      if (onFinish) {
        onFinish(mergedValues)
      }
    },
    [onFinish, initialData]
  )

  useEffect(() => {
    if (initialData && form) {
      form.resetFields()
    }
  }, [initialData, form])

  return (
    <Form
      hideRequiredMark
      scrollToFirstError
      name="productVersion"
      labelAlign="left"
      labelCol={{ span: 4 }}
      wrapperCol={{ span: 20 }}
      className={className}
      form={form}
      initialValues={initialData}
      onFinish={handleFinish}
    >
      {initialData.map((product, prodIdx) => {
        const amd64Options = allVersions
          .filter(
            (el) =>
              el.productId === product.productId &&
              el.arch === HardwareArch.x86_64
          )
          .map((el) => ({
            value: el.version,
            label: el.version,
          }))

        // const arm64Options = allVersions
        //   .filter(
        //     (el) =>
        //       el.productId === product.productId &&
        //       el.arch === HardwareArch.arm64
        //   )
        //   .map((el) => ({
        //     value: el.version,
        //     label: el.version,
        //   }))

        return (
          <Card
            title={
              <>
                <DatabaseOutlined />
                <span className={styles.cardTitleText}>
                  {t('product.name')} : {product.productId}
                </span>
              </>
            }
            bordered={false}
            key={product.productId}
          >
            <Form.Item
              style={{ padding: '0 24px' }}
              name={[prodIdx, 'arch', 'amd64']}
              label={t('form.fields.amd64')}
              rules={[
                {
                  required: true,
                  message: t('form.rules.version.required'),
                },
              ]}
            >
              <Checkbox.Group options={amd64Options} />
            </Form.Item>
            {/* <Form.Item
              style={{ padding: '0 24px' }}
              name={[prodIdx, 'arch', 'arm64']}
              label={t('form.fields.arm64')}
              rules={[
                {
                  required: true,
                  message: t('form.rules.version.required'),
                },
              ]}
            >
              <Checkbox.Group options={arm64Options} />
            </Form.Item> */}
          </Card>
        )
      })}
    </Form>
  )
}

export default ProductVersionConfig
