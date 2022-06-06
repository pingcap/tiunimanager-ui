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

import { FC } from 'react'
import { Button, Card, Form, Input, Space } from 'antd'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { loadI18n, useI18n } from '@i18n-macro'
import { isBitInt } from '@/utils/types'
import { EditMode, EditStaticData } from './helper'

import styles from './index.module.less'

loadI18n()

interface BasicInfoConfigProps {
  mode: EditMode
  staticData?: EditStaticData
}

const BasicInfoConfig: FC<BasicInfoConfigProps> = ({ mode, staticData }) => {
  const isEdit = mode === 'edit'
  const taskId = isEdit ? staticData?.taskId : undefined

  const { t } = useI18n()

  return (
    <Card className={styles.formCard} title={t('basic.title')} bordered={false}>
      {taskId ? (
        <Form.Item label={t('basic.fields.id')}>{taskId}</Form.Item>
      ) : null}
      <Form.Item
        name="name"
        label={t('basic.fields.name')}
        rules={[
          { required: true, message: t('basic.rules.name.required') },
          { min: 1, max: 20, message: t('basic.rules.name.length') },
        ]}
      >
        <Input allowClear />
      </Form.Item>
      <Form.Item
        name="tso"
        label={t('basic.fields.tso')}
        tooltip={t('basic.tips.tso')}
        rules={[
          {
            validator: (rule, value) => {
              if (!/^\d+$/.test(value) || !isBitInt(BigInt(value))) {
                return Promise.reject(new Error(t('basic.rules.tso.valid')))
              }

              return Promise.resolve()
            },
          },
        ]}
      >
        <Input disabled={isEdit} />
      </Form.Item>
      <Form.List name="filterRuleList">
        {(fields, { add, remove }, { errors }) => (
          <>
            {fields.map((field, index) => (
              <Form.Item
                className={index > 0 ? styles.formItemWithoutLabel : ''}
                label={index === 0 ? t('basic.fields.filterRule') : ''}
                key={field.key}
              >
                <Space align="baseline">
                  <Form.Item
                    {...field}
                    noStyle
                    validateTrigger={['onChange', 'onBlur']}
                    rules={[
                      {
                        type: 'regexp',
                        message: t('basic.rules.filterRule.valid'),
                      },
                    ]}
                  >
                    <Input allowClear />
                  </Form.Item>
                  {fields.length > 1 ? (
                    <MinusCircleOutlined onClick={() => remove(field.name)} />
                  ) : null}
                </Space>
              </Form.Item>
            ))}
            <Form.Item
              className={fields.length ? styles.formItemWithoutLabel : ''}
              label={!fields.length ? t('basic.fields.filterRule') : ''}
            >
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => add()}
              >
                {t('basic.action.filterRule.add')}
              </Button>
              <Form.ErrorList errors={errors} />
            </Form.Item>
          </>
        )}
      </Form.List>
    </Card>
  )
}

export default BasicInfoConfig
