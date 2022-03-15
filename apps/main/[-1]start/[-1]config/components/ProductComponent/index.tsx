import { FC, useCallback, useEffect } from 'react'
import { Card, Form, FormInstance, Input, InputNumber } from 'antd'
import { DatabaseOutlined } from '@ant-design/icons'
import { loadI18n, useI18n } from '@i18n-macro'
import { ProductItemInfo } from '@/api/model'

import styles from './index.module.less'

loadI18n()

const mergeProdCompConfig = (
  originValues: ProductItemInfo[],
  editedValues: { [k: number]: ProductItemInfo }
) => {
  const ret = originValues?.map((product, prodIdx) => {
    const editedComps = editedValues[prodIdx].components || []

    const mergedComps = product.components?.map((item, itemIdx) => {
      const { name, startPort, endPort } = editedComps[itemIdx] || {}

      return {
        ...item,
        name,
        startPort,
        endPort,
      }
    })

    return {
      productId: product.productId,
      productName: product.productName,
      components: mergedComps,
    }
  })

  return ret
}

interface ProductComponentConfigProps {
  className?: string
  data: ProductItemInfo[]
  form: FormInstance<ProductItemInfo[]>
  onFinish: (values: ProductItemInfo[]) => void
}

const ProductComponentConfig: FC<ProductComponentConfigProps> = ({
  className,
  data,
  form,
  onFinish,
}) => {
  const { t } = useI18n()

  const handleFinish = useCallback(
    (values: { [k: number]: ProductItemInfo }) => {
      const mergedValues = mergeProdCompConfig(data, values)

      if (onFinish) {
        onFinish(mergedValues)
      }
    },
    [data, onFinish]
  )

  useEffect(() => {
    if (data && form) {
      form.resetFields()
    }
  }, [data, form])

  return (
    <Form
      hideRequiredMark
      scrollToFirstError
      name="productComponent"
      labelAlign="left"
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      className={className}
      form={form}
      initialValues={data}
      onFinish={handleFinish}
    >
      {data.map((product, prodIdx) => (
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
          {product.components?.map((component, compIdx) => {
            return (
              <Card
                type="inner"
                bordered={false}
                key={component.id}
                title={`${t('fields.id')} : ${component.id}`}
              >
                <Form.Item
                  name={[prodIdx, 'components', compIdx, 'name']}
                  label={t('fields.name')}
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      min: 2,
                      max: 64,
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item label={t('fields.purpose')}>
                  {t(
                    `purpose.${component.purposeType?.toLocaleLowerCase()}`,
                    component.purposeType
                  )}
                </Form.Item>
                {component.suggestedInstancesCount?.length ? (
                  <Form.Item label={t('fields.instanceCount')}>
                    {component.suggestedInstancesCount.join(', ')}
                  </Form.Item>
                ) : (
                  <Form.Item label={t('fields.instanceRange')}>
                    {component.minInstance} ~ {component.maxInstance}
                  </Form.Item>
                )}
                <Form.Item label={t('fields.portNum')}>
                  {component.maxPort}
                </Form.Item>
                <Form.Item label={t('fields.portRange')}>
                  <Form.Item
                    noStyle
                    name={[prodIdx, 'components', compIdx, 'startPort']}
                    rules={[
                      {
                        validator: (rule, value) => {
                          const portNum = component.maxPort || 0
                          const currentEndPort = component.endPort || 0

                          const isValid = value + portNum <= currentEndPort

                          return isValid
                            ? Promise.resolve()
                            : Promise.reject(
                                new Error(t('form.rules.startPort.invalid'))
                              )
                        },
                      },
                    ]}
                  >
                    <InputNumber min={1} max={65535} precision={0} />
                  </Form.Item>
                  <span> ~ </span>
                  <Form.Item
                    noStyle
                    name={[prodIdx, 'components', compIdx, 'endPort']}
                    rules={[
                      {
                        validator: (rule, value) => {
                          const portNum = component.maxPort || 0
                          const currentStartPort = component.startPort || 0

                          const isValid = value >= currentStartPort + portNum

                          return isValid
                            ? Promise.resolve()
                            : Promise.reject(
                                new Error(t('form.rules.endPort.invalid'))
                              )
                        },
                      },
                    ]}
                  >
                    <InputNumber min={1} max={65535} precision={0} />
                  </Form.Item>
                </Form.Item>
              </Card>
            )
          })}
        </Card>
      ))}
    </Form>
  )
}

export default ProductComponentConfig
