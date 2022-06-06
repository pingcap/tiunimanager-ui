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

import { FC, useCallback, useEffect, useMemo } from 'react'
import {
  Button,
  Card,
  Collapse,
  Divider,
  Form,
  FormInstance,
  Input,
  InputNumber,
  Space,
} from 'antd'
import {
  CloseCircleOutlined,
  CloudServerOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import { loadI18n, useI18n } from '@i18n-macro'
import {
  DataCenterItemInfo,
  DCRegionItemInfo,
  DCSpecItemInfo,
  DCZoneItemInfo,
} from '@/api/model'

import styles from './index.module.less'

loadI18n()

type PurposeField = {
  [k: string]: {
    purposeType: string
    specs: DCSpecItemInfo[]
  }
}

type LocalCenterField = DataCenterItemInfo & {
  purpose: PurposeField
}

interface DataCenterConfigProps {
  className?: string
  data: DataCenterItemInfo[]
  form: FormInstance<LocalCenterField>
  onFinish: (values: DataCenterItemInfo[]) => void
}

const DataCenterConfig: FC<DataCenterConfigProps> = ({
  className,
  data,
  form,
  onFinish,
}) => {
  const { t, i18n } = useI18n()

  const specsInfo = useMemo(
    () => [
      {
        key: 'compute',
        title: t('purpose.compute'),
      },
      {
        key: 'storage',
        title: t('purpose.storage'),
      },
      {
        key: 'schedule',
        title: t('purpose.schedule'),
      },
    ],
    [i18n.language]
  )

  const localCenterData = useMemo(() => {
    const local = data.find((item) => item.id === 'Local') || {}

    const specHashmap = local.specs?.reduce(
      (prev, spec) => {
        const { purposeType } = spec

        if (!purposeType) {
          return prev
        }

        const purpose = purposeType.toLowerCase()
        const prevSpecs = prev[purpose]?.specs || []

        return {
          ...prev,
          [purpose]: {
            purposeType,
            specs: prevSpecs.concat(spec),
          },
        }
      },
      {
        compute: {
          purposeType: '',
          specs: [],
        },
        storage: {
          purposeType: '',
          specs: [],
        },
        schedule: {
          purposeType: '',
          specs: [],
        },
      } as PurposeField
    )

    return {
      ...local,
      purpose: specHashmap,
    }
  }, [data])

  const handleFinish = useCallback(
    (values: LocalCenterField) => {
      const mergedSpecs = Object.values(values.purpose)
        .map((el) => el.specs)
        .flat()
      const mergedLocalValues = {
        id: localCenterData.id,
        name: values.name,
        regions: values.regions,
        specs: mergedSpecs,
      }

      if (onFinish) {
        onFinish([mergedLocalValues])
      }
    },
    [onFinish, localCenterData]
  )

  useEffect(() => {
    if (localCenterData && form) {
      form.resetFields()
    }
  }, [localCenterData, form])

  return (
    <Form
      hideRequiredMark
      scrollToFirstError
      name="localCenter"
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 18 }}
      className={className}
      form={form}
      initialValues={localCenterData}
      onFinish={handleFinish}
    >
      <Card
        title={
          <>
            <CloudServerOutlined />
            <span className={styles.cardTitleText}>
              {t('vendor.name')} : {localCenterData.id}
            </span>
          </>
        }
        bordered={false}
      >
        <Form.Item
          className={styles.vendorFormItem}
          labelAlign="left"
          labelCol={{ flex: 'none' }}
          wrapperCol={{ flex: 'auto' }}
          name="name"
          label={t('vendorFields.name')}
          rules={[
            {
              required: true,
              whitespace: true,
              min: 2,
              max: 64,
              message: t('form.rules.vendorName.invalid'),
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Collapse defaultActiveKey={['region', 'spec']} ghost>
          <Collapse.Panel key="region" header={t('panel.region')}>
            <Form.List name="regions">
              {(rgFields, { add, remove }, { errors }) => (
                <>
                  {rgFields.map((rgField, rgIdx) => (
                    <div key={rgField.key} className={styles.formItemBlock}>
                      {rgFields.length > 1 ? (
                        <CloseCircleOutlined
                          className={styles.formItemBlockClose}
                          onClick={() => remove(rgField.name)}
                        />
                      ) : null}
                      <Form.Item
                        fieldKey={[rgField.fieldKey, 'id']}
                        name={[rgField.name, 'id']}
                        label={t('regionFields.id')}
                        rules={[
                          {
                            required: true,
                            whitespace: true,
                            min: 2,
                            max: 64,
                            message: t('form.rules.regionId.invalid'),
                          },
                          {
                            validator: (rule, value) => {
                              const regions: DCRegionItemInfo[] =
                                form.getFieldValue(['regions'])
                              const isDuplicate = regions
                                ?.filter((_, idx) => idx !== rgIdx)
                                .map((el) => el?.id)
                                .includes(value)

                              return isDuplicate
                                ? Promise.reject(
                                    new Error(
                                      t('form.rules.regionId.duplicate')
                                    )
                                  )
                                : Promise.resolve()
                            },
                          },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item
                        fieldKey={[rgField.fieldKey, 'name']}
                        name={[rgField.name, 'name']}
                        label={t('regionFields.name')}
                        rules={[
                          {
                            required: true,
                            whitespace: true,
                            min: 2,
                            max: 64,
                            message: t('form.rules.regionName.invalid'),
                          },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item label={t('regionFields.zone')}>
                        <Form.List name={[rgField.name, 'zones']}>
                          {(azFields, { add, remove }, { errors }) => (
                            <>
                              {azFields.map((azField, azIdx) => (
                                <div key={azField.key}>
                                  <Space align="baseline" size="large">
                                    <Form.Item
                                      colon={false}
                                      fieldKey={[azField.fieldKey, 'zoneId']}
                                      name={[azField.name, 'zoneId']}
                                      label={t('zoneFields.id')}
                                      rules={[
                                        {
                                          required: true,
                                          whitespace: true,
                                          min: 2,
                                          max: 64,
                                          message: t(
                                            'form.rules.zoneId.invalid'
                                          ),
                                        },
                                        {
                                          validator: (rule, value) => {
                                            const zones: DCZoneItemInfo[] =
                                              form.getFieldValue([
                                                'regions',
                                                rgField.name,
                                                'zones',
                                              ])
                                            const isDuplicate = zones
                                              ?.filter(
                                                (_, idx) => idx !== azIdx
                                              )
                                              .map((el) => el?.zoneId)
                                              .includes(value)

                                            return isDuplicate
                                              ? Promise.reject(
                                                  new Error(
                                                    t(
                                                      'form.rules.zoneId.duplicate'
                                                    )
                                                  )
                                                )
                                              : Promise.resolve()
                                          },
                                        },
                                      ]}
                                    >
                                      <Input />
                                    </Form.Item>
                                    <Form.Item
                                      colon={false}
                                      fieldKey={[azField.fieldKey, 'zoneName']}
                                      name={[azField.name, 'zoneName']}
                                      label={t('zoneFields.name')}
                                      rules={[
                                        {
                                          required: true,
                                          whitespace: true,
                                          min: 2,
                                          max: 64,
                                          message: t(
                                            'form.rules.zoneName.invalid'
                                          ),
                                        },
                                      ]}
                                    >
                                      <Input />
                                    </Form.Item>
                                    {azFields.length > 1 ? (
                                      <MinusCircleOutlined
                                        className={styles.actionIcon}
                                        onClick={() => remove(azField.name)}
                                      />
                                    ) : null}
                                  </Space>
                                </div>
                              ))}
                              <Button
                                type="dashed"
                                icon={<PlusOutlined />}
                                onClick={() => {
                                  const defaultAzVal = `Zone${rgIdx + 1}_${
                                    azFields.length + 1
                                  }`

                                  add({
                                    zoneId: defaultAzVal,
                                    zoneName: defaultAzVal,
                                  })
                                }}
                              >
                                {t('actions.zone.add')}
                              </Button>
                              <Form.ErrorList errors={errors} />
                            </>
                          )}
                        </Form.List>
                      </Form.Item>
                    </div>
                  ))}
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      const nextIdx = rgFields.length + 1
                      const defaultRgVal = `Region${nextIdx}`
                      const defaultAzVal = `Zone${nextIdx}_1`

                      add({
                        id: defaultRgVal,
                        name: defaultRgVal,
                        zones: [
                          {
                            zoneId: defaultAzVal,
                            zoneName: defaultAzVal,
                          },
                        ],
                      })
                    }}
                  >
                    {t('actions.region.add')}
                  </Button>
                  <Form.ErrorList errors={errors} />
                </>
              )}
            </Form.List>
          </Collapse.Panel>
          <Collapse.Panel key="spec" header={t('panel.spec')}>
            {specsInfo.map((info) => (
              <div key={info.key}>
                <Divider>{info.title}</Divider>
                <Form.List name={['purpose', info.key, 'specs']}>
                  {(specFields, { add, remove }, { errors }) => (
                    <>
                      {specFields.map((specField, specIdx) => (
                        <div
                          key={specField.key}
                          className={styles.formItemBlock}
                        >
                          {specFields.length > 1 ? (
                            <CloseCircleOutlined
                              className={styles.formItemBlockClose}
                              onClick={() => remove(specField.name)}
                            />
                          ) : null}
                          <Form.Item
                            fieldKey={[specField.fieldKey, 'id']}
                            name={[specField.name, 'id']}
                            label={t('specFields.id')}
                            rules={[
                              {
                                required: true,
                                whitespace: true,
                                min: 2,
                                max: 64,
                                message: t('form.rules.specId.invalid'),
                              },
                              {
                                validator: (rule, value) => {
                                  const specs: DCSpecItemInfo[] =
                                    form.getFieldValue([
                                      'purpose',
                                      info.key,
                                      'specs',
                                    ])
                                  const isDuplicate = specs
                                    ?.filter((_, idx) => idx !== specIdx)
                                    .map((el) => el?.id)
                                    .includes(value)

                                  return isDuplicate
                                    ? Promise.reject(
                                        new Error(
                                          t('form.rules.specId.duplicate')
                                        )
                                      )
                                    : Promise.resolve()
                                },
                              },
                            ]}
                          >
                            <Input />
                          </Form.Item>
                          <Form.Item
                            fieldKey={[specField.fieldKey, 'name']}
                            name={[specField.name, 'name']}
                            label={t('specFields.name')}
                            rules={[
                              {
                                required: true,
                                whitespace: true,
                                min: 2,
                                max: 64,
                                message: t('form.rules.specName.invalid'),
                              },
                            ]}
                          >
                            <Input />
                          </Form.Item>
                          <Form.Item
                            fieldKey={[specField.fieldKey, 'cpu']}
                            name={[specField.name, 'cpu']}
                            label={t('specFields.cpu')}
                            rules={[
                              {
                                required: true,
                                message: t('form.rules.specCPU.required'),
                              },
                            ]}
                          >
                            <InputNumber min={1} max={1024} precision={0} />
                          </Form.Item>
                          <Form.Item
                            fieldKey={[specField.fieldKey, 'memory']}
                            name={[specField.name, 'memory']}
                            label={t('specFields.memory')}
                            rules={[
                              {
                                required: true,
                                message: t('form.rules.specMemory.required'),
                              },
                            ]}
                          >
                            <InputNumber min={1} max={2048} precision={0} />
                          </Form.Item>
                        </div>
                      ))}
                      <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        onClick={() => {
                          const defaultSpecVal = `${info.key}${
                            specFields.length + 1
                          }`
                          add({
                            id: defaultSpecVal,
                            name: defaultSpecVal,
                            purposeType:
                              localCenterData.purpose?.[info.key]?.purposeType,
                            diskType: 'SATA',
                            cpu: 1,
                            memory: 1,
                          })
                        }}
                      >
                        {t('actions.spec.add')}
                      </Button>
                      <Form.ErrorList errors={errors} />
                    </>
                  )}
                </Form.List>
              </div>
            ))}
          </Collapse.Panel>
        </Collapse>
      </Card>
    </Form>
  )
}

export default DataCenterConfig
